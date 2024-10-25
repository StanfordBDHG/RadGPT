#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import pathlib
from firebase_functions import https_fn
from firebase_admin import initialize_app
from firebase_functions import storage_fn


initialize_app()


@https_fn.on_request()
def on_request_example(_req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")


@storage_fn.on_object_finalized()
def on_medical_report_upload(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
):
    bucket_name = event.data.bucket
    file_path = pathlib.PurePath(event.data.name)
    content_type = event.data.content_type
    print(bucket_name, file_path, content_type)
