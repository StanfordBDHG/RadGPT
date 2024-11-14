#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import json
import pathlib
import re
from typing import Optional

from firebase_functions import https_fn, options, storage_fn
from firebase_admin import initialize_app, storage, firestore
from langchain_core.prompts import PromptTemplate

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from radgraph import RadGraph, get_radgraph_processed_annotations

from text_mapping.radgraph_text_mapper import (
    add_end_ix_to_processed_annotations,
    determine_entities_in_user_entered_text,
)

initialize_app()

# Write prompt with GPT
TEMPLATE = PromptTemplate.from_template(
    # """
    # As an expert in radiology, your task is to provide a short answer for a patient that has no medical knowledge.
    # The patient has recently received a medical report which he wants to understand in more detail.
    # The following medical report has been shared with the patient:
    # {report}
    # Answer the following patient question:
    # Given the medical above what does {observation} mean?
    # Also provide up to 3 follow-up questions with a maximum of 30 words based on your answer that a patient with no medical knowledge might have and provide a short answer as well.
    # """
    """
You are an expert in radiology tasked with explaining parts of a medical report to a patient without medical knowledge.

Radiology Report: 
{report}

Patient's Question: "What does {observation} mean?"

Your Tasks:

Provide a Clear Explanation:
- Offer a detailed yet understandable explanation of the specified observation ({observation}) from the report.
- Ensure the language is simple and free of medical jargon.
- In case you are using medical jargon briefly explain the terms.

Generate Follow-Up Questions:
- Create up to three potential questions that a patient might have after reading your explanation.
- Do not add questions that are concering other parts of the text.
- Each question should be no longer than 30 words.
- Provide a concise answer for each follow-up question.
"""
)


# Pydantic
class DetailedResponse(BaseModel):
    main_answer: str = Field(
        description="Answer to the patient question with a short explanation in the context of the medical report provided by the patient."
    )
    question1: Optional[str] = Field(
        default=None,
        description="First follow-up question to the provided answer. This is optional and can also be omitted.",
    )
    answer1: Optional[str] = Field(
        default=None, description="Answer to the first follow-up question."
    )
    question2: Optional[str] = Field(
        default=None,
        description="Second follow-up question to the provided answer. This is optional and can also be omitted.",
    )
    answer2: Optional[str] = Field(
        default=None, description="Answer to the second follow-up question."
    )
    question3: Optional[str] = Field(
        default=None,
        description="Third follow-up question to the provided answer. This is optional and can also be omitted.",
    )
    answer3: Optional[str] = Field(
        default=None, description="Answer to the third follow-up question."
    )


def request_gpt(report: str, user_observation: str) -> str:
    # return DetailedResponse(
    #     main_answer="In your report, 'normal in size, shape, and position' means that your kidneys are the usual size, properly shaped, and correctly located in your body.",
    #     question1="What is the usual size of kidneys?",
    #     answer1="Typically, adult kidneys are about 10-12 cm in length, similar to the size of a large fist.",
    #     question2="Why is it important for kidneys to be in the correct position?",
    #     answer2="Correct positioning ensures that kidneys are properly connected to other organs and blood vessels, which is crucial for filtering blood and producing urine.",
    #     question3="What does 'properly shaped' mean for kidneys?",
    #     answer3="Properly shaped kidneys have a bean-like structure, which is important for their function in filtering blood and managing body fluids.",
    # )
    llm = ChatOpenAI(
        model="gpt-4-turbo",  # gpt 4 turbo
        temperature=0,
        max_tokens=1_000,
        timeout=None,
        max_retries=2,
    ).with_structured_output(DetailedResponse)

    # chain = TEMPLATE | llm | StrOutputParser()
    chain = TEMPLATE | llm

    print(report, user_observation)
    output = chain.invoke(
        {
            "report": report,
            "observation": user_observation,
        }
    )
    print(output)
    return output


@https_fn.on_call(memory=options.MemoryOption.GB_4, secrets=["OPENAI_API_KEY"])
def on_detail_request(req: https_fn.Request) -> https_fn.Response:
    uid = req.auth.uid
    if not uid:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="The function must be called while authenticated.",
        )

    file_name = req.data.get("file_name")
    token_ids = req.data.get("token_ids")
    if not file_name or not token_ids:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='The function must be called with an object containing "user_prompt".',
        )

    # possible TODO: string security check to avoid GPT injections
    # gpt_response = request_gpt("")

    db = firestore.client()
    ref = db.collection(f"users/{uid}/annotations").document(file_name)
    content = ref.get()

    text_mapping = content.get("text_mapping")
    user_provided_text = content.get("user_provided_text")

    # check token ids for correctness

    start = text_mapping[str(min(token_ids))].get("user_provided_text_start")
    end = text_mapping[str(max(token_ids))].get("user_provided_text_end")

    return_content = user_provided_text[start:end]

    detailed_reponse = request_gpt(user_provided_text, return_content)
    print(detailed_reponse)

    # new_entry = {
    #     "datetime": datetime.now(timezone.utc),
    #     "gpt_response": gpt_response,
    #     "user_prompt": user_prompt,
    # }
    # doc_ref = db.collection("users").document(uid)
    # previous_data = doc_ref.get()
    # if previous_data.exists:
    #     data = previous_data.to_dict()
    #     data["prompts"].insert(0, new_entry)  # insert at the front of the array/list
    #     doc_ref.set(data)
    # else:
    #     doc_ref.set({"prompts": [new_entry]})

    # print(detailed_reponse.model_dump())
    return detailed_reponse.model_dump()


@storage_fn.on_object_finalized(timeout_sec=300, memory=options.MemoryOption.GB_8)
def on_medical_report_upload(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
):
    file_path = pathlib.PurePath(event.data.name)

    # Forcing the pattern "users/{userid}/reports/{filename}" and also extracting userid and filename
    # Hence, it is ensured that this function gets executerd only on files in "users/{userid}/reports"
    match = re.match(
        r"^users/(?P<uid>[^/]*)/reports/(?P<file_name>[^/]*)$", str(file_path)
    )
    if match is None:
        return
    uid = match.group("uid")
    file_name = match.group("file_name")

    # based on https://firebase.google.com/docs/storage/extend-with-functions?gen=2nd
    bucket_name = event.data.bucket
    bucket = storage.bucket(bucket_name)
    file_blob = bucket.blob(str(file_path))
    file_str = file_blob.download_as_text()

    radgraph = RadGraph(model_type="radgraph-xl")
    annotations = radgraph([file_str])
    processed_annotations = get_radgraph_processed_annotations(annotations)
    text_mapping = determine_entities_in_user_entered_text(
        file_str, processed_annotations
    )

    db = firestore.client()
    ref = db.collection(f"users/{uid}/annotations").document(file_name)
    ref.set(
        {
            "processed_annotations": json.dumps(
                add_end_ix_to_processed_annotations(
                    processed_annotations["processed_annotations"],
                    processed_annotations,
                )
            ),
            "text_mapping": json.loads(json.dumps(text_mapping)),
            "user_provided_text": file_str,
        }
    )
