#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import datetime
from enum import Enum
import json
import pathlib
import re

from firebase_admin import storage, firestore
from firebase_functions import storage_fn

from function_implementation.llm_calling.chatgpt import request_report_validation
from function_implementation.radgraph.radgraph_calling import (
    get_processed_annotation_from_radgraph,
)
from function_implementation.text_mapping.radgraph_text_mapper import (
    add_end_ix_to_processed_annotations,
    get_entity_mapping_in_user_entered_text,
)

MAX_REPORTS_UPLOAD = 5


class ErrorCode(Enum):
    VALIDATION_FAILED = 1
    UPLOAD_LIMIT_REACHED = 2


def __get_report_from_cloud_storage(
    bucket_name: str, file_path: pathlib.PurePath
):  # pragma: no cover
    # Based on https://firebase.google.com/docs/storage/extend-with-functions?gen=2nd
    bucket = storage.bucket(bucket_name)
    file_blob = bucket.blob(str(file_path))
    return file_blob.download_as_text()


def __set_report_meta_data(
    uid: int, file_name: str, document_data: dict
):  # pragma: no cover
    db = firestore.client()
    ref = db.collection(f"users/{uid}/{file_name}").document("report_meta_data")
    ref.set(document_data)


def __update_report_meta_data(
    uid: int, file_name, document_data: dict
):  # pragma: no cover
    db = firestore.client()
    ref = db.collection(f"users/{uid}/{file_name}").document("report_meta_data")
    ref.update(document_data)


def __get_postprocessed_annotations(user_provided_report: str):
    processed_annotations = get_processed_annotation_from_radgraph(user_provided_report)
    text_mapping = get_entity_mapping_in_user_entered_text(
        user_provided_report, processed_annotations
    )
    processed_annotations = add_end_ix_to_processed_annotations(
        processed_annotations["processed_annotations"],
        processed_annotations,
    )
    return processed_annotations, text_mapping


def __is_upload_limiter_valid(uid: int, file_name: str) -> bool:
    db = firestore.client()
    transaction = db.transaction()
    upload_limiter_file_ref = db.collection("users_limit").document(f"{uid}")

    @firestore.transactional
    def update_user_uploaded_documents(transaction):
        snapshot = upload_limiter_file_ref.get(transaction=transaction)

        limit = snapshot.get("limit") if snapshot.exists else 5
        document_list = snapshot.get("reports") if snapshot.exists else []

        if len(document_list) >= limit:
            return False

        document_list.append(
            {"file_name": file_name, "access_date": datetime.datetime.now().timestamp()}
        )
        transaction.set(
            upload_limiter_file_ref, {"limit": limit, "reports": document_list}
        )
        return True

    return update_user_uploaded_documents(transaction)


def on_medical_report_upload_impl(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
):
    # Forcing the pattern "users/{userid}/reports/{filename}" and also extracting userid and filename
    # Hence, it is ensured that this function gets executed only on files in "users/{userid}/reports"
    match = re.match(
        r"^users/(?P<uid>[^/]+)/reports/(?P<file_name>[^/]+)$", event.data.name
    )
    if match is None:
        return
    uid = match.group("uid")
    file_name = match.group("file_name")

    file_path = pathlib.PurePath(event.data.name)
    user_provided_report = __get_report_from_cloud_storage(event.data.bucket, file_path)

    __set_report_meta_data(
        uid,
        file_name,
        {
            "user_provided_text": user_provided_report,
        },
    )

    if __is_upload_limiter_valid(uid, file_name) is False:
        __update_report_meta_data(
            uid, file_name, {"error_code": ErrorCode.UPLOAD_LIMIT_REACHED.value}
        )
        return

    if request_report_validation(user_provided_report) is False:
        __update_report_meta_data(
            uid, file_name, {"error_code": ErrorCode.VALIDATION_FAILED.value}
        )
        return

    processed_annotations, text_mapping = __get_postprocessed_annotations(
        user_provided_report
    )
    __update_report_meta_data(
        uid,
        file_name,
        {
            "processed_annotations": json.dumps(processed_annotations),
            "text_mapping": json.loads(json.dumps(text_mapping)),
        },
    )
