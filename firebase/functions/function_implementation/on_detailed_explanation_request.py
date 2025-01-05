#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import dataclasses
import json
from typing import Any

from firebase_functions import https_fn
from firebase_admin import firestore
from google.cloud.firestore_v1.document import DocumentSnapshot

from function_implementation.llm_calling.chatgpt import request_gpt


def __get_concept(processed_annotation) -> str:
    returned_concept = processed_annotation["observation"]
    if processed_annotation["located_at"]:
        returned_concept += f" {' '.join(processed_annotation['located_at'])}"
    if processed_annotation["suggestive_of"]:
        returned_concept += f" {' '.join(processed_annotation['suggestive_of'])}"
    return returned_concept


def __get_cached_answer(
    uid: int, file_name: str, observation_id: int
) -> DocumentSnapshot:  # pragma: no cover
    db = firestore.client()
    annotations_folder_ref = db.collection(f"users/{uid}/{file_name}")

    observation_ref = annotations_folder_ref.document(f"cached_answer_{observation_id}")
    return observation_ref.get()


def __get_report_meta_data(
    uid: int, file_name: str
) -> DocumentSnapshot:  # pragma: no cover
    db = firestore.client()
    annotations_folder_ref = db.collection(f"users/{uid}/{file_name}")
    processed_annotation_ref = annotations_folder_ref.document("report_meta_data")
    return processed_annotation_ref.get()


def __store_detailed_response(
    uid: int, file_name: str, observation_id: int, detailed_response: dict[str, Any]
) -> None:  # pragma: no cover
    db = firestore.client()
    annotations_folder_ref = db.collection(f"users/{uid}/{file_name}")

    observation_ref = annotations_folder_ref.document(f"cached_answer_{observation_id}")
    observation_ref.set(detailed_response)


def on_detailed_explanation_request_impl(req: https_fn.Request) -> https_fn.Response:
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

    cached_gpt_answer = __get_cached_answer(uid, file_name, observation_id)
    if cached_gpt_answer.exists:
        return cached_gpt_answer.to_dict()

    content = __get_report_meta_data(uid, file_name)

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

    concept = __get_concept(processed_annotation)

    detailed_response = dataclasses.asdict(request_gpt(user_provided_text, concept))
    __store_detailed_response(uid, file_name, observation_id, detailed_response)
    return detailed_response
