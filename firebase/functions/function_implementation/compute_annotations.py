#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import asyncio
import datetime
from enum import Enum
import functools
import json
import pathlib
import re

from firebase_admin import storage, firestore
from firebase_functions import https_fn, storage_fn
from google.cloud.firestore_v1.document import DocumentReference

from function_implementation.llm_calling.chatgpt import request_report_validation
from function_implementation.radgraph.radgraph_calling import (
    get_processed_annotation_from_radgraph,
)
from function_implementation.text_mapping.radgraph_text_mapper import (
    add_end_ix_to_processed_annotations,
    get_entity_mapping_in_user_entered_text,
)

MAX_REPORTS_UPLOAD = 5
COMPUTE_ANNOTATIONS_TIMEOUT_SEC = 70


class ErrorCode(Enum):
    VALIDATION_FAILED = 1
    UPLOAD_LIMIT_REACHED = 2
    TIMEOUT = 3


def __get_report_from_cloud_storage(
    bucket_name: str, file_path: pathlib.PurePath
) -> str:  # pragma: no cover
    # Based on https://firebase.google.com/docs/storage/extend-with-functions?gen=2nd
    bucket = storage.bucket(bucket_name)
    file_blob = bucket.blob(str(file_path))
    return file_blob.download_as_text()


def __get_report_meta_data_ref(
    uid: int, file_name: str
) -> DocumentReference:  # pragma: no cover
    db = firestore.client()
    ref = db.collection(f"users/{uid}/{file_name}").document("report_meta_data")
    return ref


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

        if file_name in map(lambda x: x["file_name"], document_list):
            return True

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


def __compute_annotations(
    user_provided_report: str,
    uid: str,
    file_name: str,
    report_meta_data_ref: DocumentReference,
):
    if __is_upload_limiter_valid(uid, file_name) is False:
        report_meta_data_ref.update(
            {"error_code": ErrorCode.UPLOAD_LIMIT_REACHED.value}
        )
        return

    if request_report_validation(user_provided_report) is False:
        report_meta_data_ref.update({"error_code": ErrorCode.VALIDATION_FAILED.value})
        return

    processed_annotations, text_mapping = __get_postprocessed_annotations(
        user_provided_report
    )
    report_meta_data_ref.update(
        {
            "processed_annotations": json.dumps(processed_annotations),
            "text_mapping": json.loads(json.dumps(text_mapping)),
        },
    )


async def __compute_annotations_timeout(
    bucket: str,
    file_path: str,
    uid: str,
    file_name: str,
    timeout: int,
    report_meta_data_ref: DocumentReference,
):
    try:
        user_provided_report = __get_report_from_cloud_storage(bucket, file_path)

        report_meta_data_ref.set(
            {
                "user_provided_text": user_provided_report,
                "create_time": firestore.SERVER_TIMESTAMP,
            }
        )

        loop = asyncio.get_running_loop()
        await asyncio.wait_for(
            loop.run_in_executor(
                None,
                functools.partial(
                    __compute_annotations,
                    user_provided_report,
                    uid,
                    file_name,
                    report_meta_data_ref,
                ),
            ),
            timeout=timeout,
        )
    except Exception as e:
        report_meta_data_ref.update({"error_code": ErrorCode.TIMEOUT.value})
        if not isinstance(e, asyncio.TimeoutError):
            raise


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

    asyncio.run(
        __compute_annotations_timeout(
            event.data.bucket,
            file_path,
            uid,
            file_name,
            COMPUTE_ANNOTATIONS_TIMEOUT_SEC,
            __get_report_meta_data_ref(uid, file_name),
        )
    )


def on_annotate_file_retrigger_impl(req: https_fn.Request) -> https_fn.Response:
    uid = req.auth.uid
    if uid is None:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="The function must be called while authenticated.",
        )

    file_name = req.data.get("file_name")
    if file_name is None:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='The function must be called with an object containing "file_name".',
        )

    report_meta_data_ref = __get_report_meta_data_ref(uid, file_name)

    report_meta_data_document = report_meta_data_ref.get()
    if not report_meta_data_document.exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.NOT_FOUND,
            message='The function must be called with an object containing "file_name" that is a valid file.',
        )

    error_code = report_meta_data_document.to_dict().get("error_code", None)
    if error_code is None or error_code is not ErrorCode.TIMEOUT.value:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
            message="The function must be called on an object that failed due to timeout.",
        )

    file_path = f"users/{uid}/reports/{file_name}"

    asyncio.run(
        __compute_annotations_timeout(
            storage.bucket().name,
            file_path,
            uid,
            file_name,
            COMPUTE_ANNOTATIONS_TIMEOUT_SEC,
            report_meta_data_ref,
        )
    )
