#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import dataclasses
import json
import pathlib
import re

from firebase_functions import https_fn, options, storage_fn
from firebase_admin import initialize_app, storage, firestore
from radgraph import RadGraph, get_radgraph_processed_annotations

from llm_calling.chatgpt import request_gpt
from text_mapping.radgraph_text_mapper import (
    add_end_ix_to_processed_annotations,
    get_entity_mapping_in_user_entered_text,
)

initialize_app()


def get_concept(processed_annotation) -> str:
    returned_concept = processed_annotation["observation"]
    if processed_annotation["located_at"]:
        returned_concept += f" {' '.join(processed_annotation['located_at'])}"
    if processed_annotation["suggestive_of"]:
        returned_concept += f" {' '.join(processed_annotation['suggestive_of'])}"
    return returned_concept


@https_fn.on_call(memory=options.MemoryOption.GB_4, secrets=["OPENAI_API_KEY"])
def on_detailed_explanation_request(req: https_fn.Request) -> https_fn.Response:
    uid = req.auth.uid
    if uid is None:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="The function must be called while authenticated.",
        )

    file_name = req.data.get("file_name")
    observation_id = req.data.get("observation_id")
    if file_name is None or observation_id is None:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='The function must be called with an object containing "user_prompt".',
        )

    # TODO: Security check to avoid non radiology reports and GPT injections

    db = firestore.client()
    annotations_folder_ref = db.collection(f"users/{uid}/{file_name}")

    # Check if already exists
    observation_ref = annotations_folder_ref.document(f"cached_answer_{observation_id}")
    cached_gpt_answer = observation_ref.get()
    if cached_gpt_answer.exists:
        return cached_gpt_answer.to_dict()

    processed_annotation_ref = annotations_folder_ref.document("report_meta_data")
    content = processed_annotation_ref.get()

    if not content.exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Invalid file name.",
        )

    text_mapping = content.get("text_mapping")
    user_provided_text = content.get("user_provided_text")
    processed_annotations = content.get("processed_annotations")

    if not text_mapping or not user_provided_text or not processed_annotations:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
            message="Precondition missing for detailed explanation request.",
        )

    processed_annotations = json.loads(processed_annotations)

    if not (0 <= observation_id < len(processed_annotations)):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Invalid observation id.",
        )
    processed_annotation = processed_annotations[observation_id]

    concept = get_concept(processed_annotation)

    detailed_reponse = dataclasses.asdict(request_gpt(user_provided_text, concept))
    observation_ref.set(detailed_reponse)
    return detailed_reponse


@storage_fn.on_object_finalized(memory=options.MemoryOption.GB_4)
def on_medical_report_upload(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
):
    file_path = pathlib.PurePath(event.data.name)

    # Forcing the pattern "users/{userid}/reports/{filename}" and also extracting userid and filename
    # Hence, it is ensured that this function gets executed only on files in "users/{userid}/reports"
    match = re.match(
        r"^users/(?P<uid>[^/]*)/reports/(?P<file_name>[^/]*)$", str(file_path)
    )
    if match is None:
        return
    uid = match.group("uid")
    file_name = match.group("file_name")

    db = firestore.client()
    ref = db.collection(f"users/{uid}/{file_name}").document("report_meta_data")

    # Based on https://firebase.google.com/docs/storage/extend-with-functions?gen=2nd
    bucket_name = event.data.bucket
    bucket = storage.bucket(bucket_name)
    file_blob = bucket.blob(str(file_path))
    file_str = file_blob.download_as_text()

    ref.set(
        {
            "user_provided_text": file_str,
        }
    )

    radgraph = RadGraph(model_type="radgraph-xl")
    annotations = radgraph([file_str])
    processed_annotations = get_radgraph_processed_annotations(annotations)
    text_mapping = get_entity_mapping_in_user_entered_text(
        file_str, processed_annotations
    )

    ref.update(
        {
            "processed_annotations": json.dumps(
                add_end_ix_to_processed_annotations(
                    processed_annotations["processed_annotations"],
                    processed_annotations,
                )
            ),
            "text_mapping": json.loads(json.dumps(text_mapping)),
        }
    )
