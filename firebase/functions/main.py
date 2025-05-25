#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from firebase_admin import initialize_app
from firebase_functions import https_fn, storage_fn
from function_implementation.on_detailed_explanation_request import (
    on_detailed_explanation_request_impl,
)
from function_implementation.compute_annotations import (
    on_annotate_file_retrigger_impl,
    on_medical_report_upload_impl,
)
from function_implementation.on_report_meta_data_delete import (
    on_report_meta_data_delete_impl,
)

initialize_app()


@storage_fn.on_object_finalized(
    secrets=["OPENAI_API_KEY"], timeout_sec=90, max_instances=5
)
def on_medical_report_upload(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
):
    on_medical_report_upload_impl(event)
    return


@https_fn.on_call(secrets=["OPENAI_API_KEY"], timeout_sec=90, max_instances=5)
def on_annotate_file_retrigger(
    req: https_fn.Request,
):
    on_annotate_file_retrigger_impl(req)
    return https_fn.Response(status=204)


@https_fn.on_call(secrets=["OPENAI_API_KEY"], timeout_sec=90, max_instances=5)
def on_detailed_explanation_request(
    req: https_fn.Request,
) -> https_fn.Response:
    return on_detailed_explanation_request_impl(req)


@storage_fn.on_object_deleted(max_instances=5)
def on_report_meta_data_delete(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
) -> None:
    on_report_meta_data_delete_impl(event)
    return
