#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import json
import pathlib
from unittest.mock import ANY
import pytest

from function_implementation.on_medical_report_upload import (
    ErrorCode,
    on_medical_report_upload_impl,
)


@pytest.mark.parametrize(
    "uid,report_uuid",
    [
        (uid, report_uuid)
        for uid in ["<uid>", "", None]
        for report_uuid in ["<report_uuid>", None]
        if not (uid == "<uid>" and report_uuid == "<report_uuid>")
    ],
)
def test_invalid_path(mocker, uid, report_uuid):
    bucket = "<bucket>"
    mock_event = mocker.MagicMock()
    uid_segement = f"{uid}/" if uid is not None else ""
    report_uuid_segment = report_uuid if report_uuid is not None else ""
    mock_event.data.name = f"users/{uid_segement}reports/{report_uuid_segment}"
    mock_event.data.bucket = bucket

    mocked_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_report_from_cloud_storage",
    )
    mocked_function.assert_not_called()

    on_medical_report_upload_impl(mock_event)


@pytest.mark.parametrize(
    "is_report_gpt_valid",
    [True, False],
)
def test_upload_limiter_failed(mocker, is_report_gpt_valid):
    bucket = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_event = mocker.MagicMock()
    mock_event.data.name = f"users/{uid}/reports/{report_uuid}"
    mock_event.data.bucket = bucket

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__set_report_meta_data",
    )

    processed_annotation = "<processed_annotation>"
    text_mapping = "<text_mapping>"
    mocked_get_postprocessed_annotation = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_postprocessed_annotations",
        return_value=(processed_annotation, text_mapping),
    )

    mocked_update_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__update_report_meta_data",
    )

    mocked_request_report_validation_function = mocker.patch(
        "function_implementation.on_medical_report_upload.request_report_validation",
        return_value=is_report_gpt_valid,
    )

    mocked__is_upload_limiter_valid_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__is_upload_limiter_valid",
        return_value=False,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        uid,
        report_uuid,
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_get_postprocessed_annotation.assert_not_called()

    mocked__is_upload_limiter_valid_function.assert_called_once_with(uid, report_uuid)

    mocked_request_report_validation_function.assert_not_called()

    mocked_update_report_meta_data_function.assert_called_once_with(
        uid,
        report_uuid,
        {"error_code": ErrorCode.UPLOAD_LIMIT_REACHED.value},
    )


def test_gpt_validation_failed(mocker):
    bucket = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_event = mocker.MagicMock()
    mock_event.data.name = f"users/{uid}/reports/{report_uuid}"
    mock_event.data.bucket = bucket

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__set_report_meta_data",
    )

    processed_annotation = "<processed_annotation>"
    text_mapping = "<text_mapping>"
    mocked_get_postprocessed_annotation = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_postprocessed_annotations",
        return_value=(processed_annotation, text_mapping),
    )

    mocked_update_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__update_report_meta_data",
    )

    mocked_request_report_validation_function = mocker.patch(
        "function_implementation.on_medical_report_upload.request_report_validation",
        return_value=False,
    )

    mocked__is_upload_limiter_valid_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__is_upload_limiter_valid",
        return_value=True,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        uid,
        report_uuid,
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_get_postprocessed_annotation.assert_not_called()

    mocked__is_upload_limiter_valid_function.assert_called_once_with(uid, report_uuid)

    mocked_request_report_validation_function.assert_called_once_with(
        user_provided_report
    )

    mocked_update_report_meta_data_function.assert_called_once_with(
        uid,
        report_uuid,
        {"error_code": ErrorCode.VALIDATION_FAILED.value},
    )


def test_mocked_flow(mocker):
    bucket = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_event = mocker.MagicMock()
    mock_event.data.name = f"users/{uid}/reports/{report_uuid}"
    mock_event.data.bucket = bucket

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__set_report_meta_data",
    )

    processed_annotation = "<processed_annotation>"
    text_mapping = "<text_mapping>"
    mocked_get_postprocessed_annotation = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_postprocessed_annotations",
        return_value=(processed_annotation, text_mapping),
    )

    mocked_update_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__update_report_meta_data",
    )

    mocked_request_report_validation_function = mocker.patch(
        "function_implementation.on_medical_report_upload.request_report_validation",
        return_value=True,
    )

    mocked__is_upload_limiter_valid_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__is_upload_limiter_valid",
        return_value=True,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        uid,
        report_uuid,
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_get_postprocessed_annotation.assert_called_once_with(user_provided_report)

    mocked_request_report_validation_function.assert_called_once_with(
        user_provided_report
    )

    mocked__is_upload_limiter_valid_function.assert_called_once_with(uid, report_uuid)

    mocked_update_report_meta_data_function.assert_called_once_with(
        uid,
        report_uuid,
        {
            "processed_annotations": json.dumps(processed_annotation),
            "text_mapping": text_mapping,
        },
    )
