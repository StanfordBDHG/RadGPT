#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import json
import pathlib
import time
from unittest.mock import ANY
import pytest

from function_implementation import compute_annotations
from function_implementation.compute_annotations import (
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
        "function_implementation.compute_annotations.__get_report_from_cloud_storage",
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
    mock_report_meta_data_ref = mocker.MagicMock()

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.compute_annotations.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.set = mocked_set_report_meta_data_function

    mocked_update_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.update = mocked_update_report_meta_data_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    processed_annotation = "<processed_annotation>"
    text_mapping = "<text_mapping>"
    mocked_get_postprocessed_annotation = mocker.patch(
        "function_implementation.compute_annotations.__get_postprocessed_annotations",
        return_value=(processed_annotation, text_mapping),
    )

    mocked_request_report_validation_function = mocker.patch(
        "function_implementation.compute_annotations.request_report_validation",
        return_value=is_report_gpt_valid,
    )

    mocked__is_upload_limiter_valid_function = mocker.patch(
        "function_implementation.compute_annotations.__is_upload_limiter_valid",
        return_value=False,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_get_postprocessed_annotation.assert_not_called()

    mocked__is_upload_limiter_valid_function.assert_called_once_with(uid, report_uuid)

    mocked_request_report_validation_function.assert_not_called()

    mocked_update_report_meta_data_function.assert_called_once_with(
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
    mock_report_meta_data_ref = mocker.MagicMock()

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.compute_annotations.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.set = mocked_set_report_meta_data_function

    mocked_update_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.update = mocked_update_report_meta_data_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    processed_annotation = "<processed_annotation>"
    text_mapping = "<text_mapping>"
    mocked_get_postprocessed_annotation = mocker.patch(
        "function_implementation.compute_annotations.__get_postprocessed_annotations",
        return_value=(processed_annotation, text_mapping),
    )

    mocked_request_report_validation_function = mocker.patch(
        "function_implementation.compute_annotations.request_report_validation",
        return_value=False,
    )

    mocked__is_upload_limiter_valid_function = mocker.patch(
        "function_implementation.compute_annotations.__is_upload_limiter_valid",
        return_value=True,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_get_postprocessed_annotation.assert_not_called()

    mocked__is_upload_limiter_valid_function.assert_called_once_with(uid, report_uuid)

    mocked_request_report_validation_function.assert_called_once_with(
        user_provided_report
    )

    mocked_update_report_meta_data_function.assert_called_once_with(
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
    mock_report_meta_data_ref = mocker.MagicMock()

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.compute_annotations.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )
    mocked_set_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.set = mocked_set_report_meta_data_function

    mocked_update_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.update = mocked_update_report_meta_data_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    processed_annotation = "<processed_annotation>"
    text_mapping = "<text_mapping>"
    mocked_get_postprocessed_annotation = mocker.patch(
        "function_implementation.compute_annotations.__get_postprocessed_annotations",
        return_value=(processed_annotation, text_mapping),
    )

    mocked_request_report_validation_function = mocker.patch(
        "function_implementation.compute_annotations.request_report_validation",
        return_value=True,
    )

    mocked__is_upload_limiter_valid_function = mocker.patch(
        "function_implementation.compute_annotations.__is_upload_limiter_valid",
        return_value=True,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_get_postprocessed_annotation.assert_called_once_with(user_provided_report)

    mocked_request_report_validation_function.assert_called_once_with(
        user_provided_report
    )

    mocked__is_upload_limiter_valid_function.assert_called_once_with(uid, report_uuid)

    mocked_update_report_meta_data_function.assert_called_once_with(
        {
            "processed_annotations": json.dumps(processed_annotation),
            "text_mapping": text_mapping,
        },
    )


def test_runtime_error(mocker):
    bucket = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_event = mocker.MagicMock()
    mock_event.data.name = f"users/{uid}/reports/{report_uuid}"
    mock_event.data.bucket = bucket
    mock_report_meta_data_ref = mocker.MagicMock()

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.compute_annotations.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.set = mocked_set_report_meta_data_function

    mocked_update_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.update = mocked_update_report_meta_data_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    mocker.patch.object(
        compute_annotations,
        "COMPUTE_ANNOTATIONS_TIMEOUT_SEC",
        0,
    )

    def raise_runtime_error(_user_provided_report, _uid, _file_name):
        raise RuntimeError

    mocked_compute_annotations = mocker.patch(
        "function_implementation.compute_annotations.__compute_annotations",
        side_effect=raise_runtime_error,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_update_report_meta_data_function.assert_called_once_with(
        {"error_code": ErrorCode.TIMEOUT.value}
    )

    mocked_compute_annotations.assert_called_once_with(
        user_provided_report, uid, report_uuid, mock_report_meta_data_ref
    )


def test_timeout(mocker):
    bucket = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_event = mocker.MagicMock()
    mock_event.data.name = f"users/{uid}/reports/{report_uuid}"
    mock_event.data.bucket = bucket
    mock_report_meta_data_ref = mocker.MagicMock()

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.compute_annotations.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.set = mocked_set_report_meta_data_function

    mocked_update_report_meta_data_function = mocker.MagicMock(return_value=None)
    mock_report_meta_data_ref.update = mocked_update_report_meta_data_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    mocker.patch.object(
        compute_annotations,
        "COMPUTE_ANNOTATIONS_TIMEOUT_SEC",
        0,
    )

    def delay(_user_provided_report, _uid, _file_name):
        time.sleep(0.1)

    mocked_compute_annotations = mocker.patch(
        "function_implementation.compute_annotations.__compute_annotations",
        side_effect=delay,
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        {"user_provided_text": user_provided_report, "create_time": ANY},
    )

    mocked_update_report_meta_data_function.assert_called_once_with(
        {"error_code": ErrorCode.TIMEOUT.value}
    )

    mocked_compute_annotations.assert_called_once_with(
        user_provided_report, uid, report_uuid, mock_report_meta_data_ref
    )
