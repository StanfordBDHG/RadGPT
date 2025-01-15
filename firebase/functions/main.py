#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from firebase_admin import initialize_app
from firebase_functions import https_fn, options, storage_fn

from function_implementation.on_detailed_explanation_request import (
    on_detailed_explanation_request_impl,
)
from function_implementation.on_medical_report_upload import (
    on_medical_report_upload_impl,
)

initialize_app()


@storage_fn.on_object_finalized(memory=options.MemoryOption.GB_8)
def on_medical_report_upload(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
):
    on_medical_report_upload_impl(event)


@https_fn.on_call(memory=options.MemoryOption.GB_4, secrets=["OPENAI_API_KEY"])
def on_detailed_explanation_request(
    req: https_fn.Request,
) -> https_fn.Response:
    return on_detailed_explanation_request_impl(req)
