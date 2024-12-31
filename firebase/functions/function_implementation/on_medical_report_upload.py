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

from firebase_admin import storage, firestore
from firebase_functions import storage_fn
from radgraph import RadGraph, get_radgraph_processed_annotations

from function_implementation.text_mapping.radgraph_text_mapper import (
    add_end_ix_to_processed_annotations,
    get_entity_mapping_in_user_entered_text,
)


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


def __get_processed_annotation_from_radgraph(user_provided_report: str):
    radgraph = RadGraph(model_type="radgraph-xl")
    annotations = radgraph([user_provided_report])
    return get_radgraph_processed_annotations(annotations)


def __get_postprocessed_annotations(user_provided_report):
    processed_annotations = __get_processed_annotation_from_radgraph(
        user_provided_report
    )
    text_mapping = get_entity_mapping_in_user_entered_text(
        user_provided_report, processed_annotations
    )
    processed_annotations = add_end_ix_to_processed_annotations(
        processed_annotations["processed_annotations"],
        processed_annotations,
    )
    return processed_annotations, text_mapping


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
