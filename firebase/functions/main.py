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

from firebase_functions import https_fn, options, storage_fn
from firebase_admin import initialize_app, storage, firestore
from radgraph import RadGraph, get_radgraph_processed_annotations

from text_mapping.radgraph_text_mapper import (
    add_end_ix_to_processed_annotations,
    get_entity_mapping_in_user_entered_text,
)

initialize_app()


@https_fn.on_request(memory=options.MemoryOption.GB_4)
def on_request_example(_req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")


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
    ref = db.collection(f"users/{uid}/annotations").document(file_name)

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
