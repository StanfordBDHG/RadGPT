#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import asyncio
import json
from unittest.mock import ANY
import pytest

from firebase_functions import https_fn

from function_implementation import compute_annotations
from function_implementation.compute_annotations import (
    ErrorCode,
    on_annotate_file_retrigger_impl,
)


def test_invalid_auth_object(mocker):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = None
    with pytest.raises(https_fn.HttpsError):
        on_annotate_file_retrigger_impl(mock_request)


def test_invalid_file_name(mocker):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {}
    with pytest.raises(https_fn.HttpsError):
        on_annotate_file_retrigger_impl(mock_request)


def test_report_meta_data_document_not_existent(mocker):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {"file_name": "<file_name>"}

    mock_report_meta_data_ref = mocker.MagicMock()
    mock_report_meta_data_ref_get = mocker.MagicMock()
    mock_report_meta_data_ref_get.exists = False

    mocked_report_meta_data_ref_get_function = mocker.MagicMock(
        return_value=mock_report_meta_data_ref_get
    )
    mock_report_meta_data_ref.get = mocked_report_meta_data_ref_get_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    with pytest.raises(https_fn.HttpsError):
        on_annotate_file_retrigger_impl(mock_request)

    mocked_report_meta_data_ref_get_function.assert_called_once()


@pytest.mark.parametrize(
    "error_code",
    [ErrorCode.UPLOAD_LIMIT_REACHED.value, ErrorCode.VALIDATION_FAILED.value],
)
def test_report_meta_data_document_not_containing_error_code(mocker, error_code):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {"file_name": "<file_name>"}

    mock_report_meta_data_ref = mocker.MagicMock()
    mock_report_meta_data_ref_get = mocker.MagicMock()
    mock_report_meta_data_ref_get.exists = True
    mocked_report_meta_data_to_dict_function = mocker.MagicMock(
        return_value={"error_code": error_code}
    )
    mock_report_meta_data_ref_get.to_dict = mocked_report_meta_data_to_dict_function

    mocked_report_meta_data_ref_get_function = mocker.MagicMock(
        return_value=mock_report_meta_data_ref_get
    )
    mock_report_meta_data_ref.get = mocked_report_meta_data_ref_get_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

    with pytest.raises(https_fn.HttpsError):
        on_annotate_file_retrigger_impl(mock_request)

    mocked_report_meta_data_ref_get_function.assert_called_once()
    mocked_report_meta_data_to_dict_function.assert_called_once()


@pytest.mark.parametrize(
    "is_report_gpt_valid",
    [True, False],
)
def test_upload_limiter_failed(mocker, is_report_gpt_valid):
    bucket_name = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_report_meta_data_ref = mocker.MagicMock()

    mock_request = mocker.MagicMock()
    mock_request.auth.uid = uid
    mock_request.data = {"file_name": report_uuid}

    mock_report_meta_data_ref = mocker.MagicMock()
    mock_report_meta_data_ref_get = mocker.MagicMock()
    mock_report_meta_data_ref_get.exists = True
    mocked_report_meta_data_to_dict_function = mocker.MagicMock(
        return_value={"error_code": ErrorCode.TIMEOUT.value}
    )
    mock_report_meta_data_ref_get.to_dict = mocked_report_meta_data_to_dict_function

    mocked_report_meta_data_ref_get_function = mocker.MagicMock(
        return_value=mock_report_meta_data_ref_get
    )
    mock_report_meta_data_ref.get = mocked_report_meta_data_ref_get_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

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

    mock_bucket = mocker.MagicMock()
    mock_bucket.name = bucket_name

    mock_storage = mocker.MagicMock()
    mock_storage.bucket.return_value = mock_bucket
    mocker.patch("function_implementation.compute_annotations.storage", mock_storage)

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

    on_annotate_file_retrigger_impl(mock_request)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket_name, ANY
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
    bucket_name = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_report_meta_data_ref = mocker.MagicMock()

    mock_request = mocker.MagicMock()
    mock_request.auth.uid = uid
    mock_request.data = {"file_name": report_uuid}

    mock_report_meta_data_ref = mocker.MagicMock()
    mock_report_meta_data_ref_get = mocker.MagicMock()
    mock_report_meta_data_ref_get.exists = True
    mocked_report_meta_data_to_dict_function = mocker.MagicMock(
        return_value={"error_code": ErrorCode.TIMEOUT.value}
    )
    mock_report_meta_data_ref_get.to_dict = mocked_report_meta_data_to_dict_function

    mocked_report_meta_data_ref_get_function = mocker.MagicMock(
        return_value=mock_report_meta_data_ref_get
    )
    mock_report_meta_data_ref.get = mocked_report_meta_data_ref_get_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

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

    mock_bucket = mocker.MagicMock()
    mock_bucket.name = bucket_name

    mock_storage = mocker.MagicMock()
    mock_storage.bucket.return_value = mock_bucket
    mocker.patch("function_implementation.compute_annotations.storage", mock_storage)

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

    on_annotate_file_retrigger_impl(mock_request)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket_name, ANY
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
    bucket_name = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_report_meta_data_ref = mocker.MagicMock()

    mock_request = mocker.MagicMock()
    mock_request.auth.uid = uid
    mock_request.data = {"file_name": report_uuid}

    mock_report_meta_data_ref = mocker.MagicMock()
    mock_report_meta_data_ref_get = mocker.MagicMock()
    mock_report_meta_data_ref_get.exists = True
    mocked_report_meta_data_to_dict_function = mocker.MagicMock(
        return_value={"error_code": ErrorCode.TIMEOUT.value}
    )
    mock_report_meta_data_ref_get.to_dict = mocked_report_meta_data_to_dict_function

    mocked_report_meta_data_ref_get_function = mocker.MagicMock(
        return_value=mock_report_meta_data_ref_get
    )
    mock_report_meta_data_ref.get = mocked_report_meta_data_ref_get_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

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

    mock_bucket = mocker.MagicMock()
    mock_bucket.name = bucket_name

    mock_storage = mocker.MagicMock()
    mock_storage.bucket.return_value = mock_bucket
    mocker.patch("function_implementation.compute_annotations.storage", mock_storage)

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

    on_annotate_file_retrigger_impl(mock_request)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket_name, ANY
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


def test_timeout(mocker):
    bucket_name = "<bucket>"
    uid = "<uid>"
    report_uuid = "<report_uuid>"
    user_provided_report = "<user_provided_report>"
    mock_report_meta_data_ref = mocker.MagicMock()

    mock_request = mocker.MagicMock()
    mock_request.auth.uid = uid
    mock_request.data = {"file_name": report_uuid}

    mock_report_meta_data_ref = mocker.MagicMock()
    mock_report_meta_data_ref_get = mocker.MagicMock()
    mock_report_meta_data_ref_get.exists = True
    mocked_report_meta_data_to_dict_function = mocker.MagicMock(
        return_value={"error_code": ErrorCode.TIMEOUT.value}
    )
    mock_report_meta_data_ref_get.to_dict = mocked_report_meta_data_to_dict_function

    mocked_report_meta_data_ref_get_function = mocker.MagicMock(
        return_value=mock_report_meta_data_ref_get
    )
    mock_report_meta_data_ref.get = mocked_report_meta_data_ref_get_function

    mocker.patch(
        "function_implementation.compute_annotations.__get_report_meta_data_ref",
        return_value=mock_report_meta_data_ref,
    )

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

    mock_bucket = mocker.MagicMock()
    mock_bucket.name = bucket_name

    mock_storage = mocker.MagicMock()
    mock_storage.bucket.return_value = mock_bucket
    mocker.patch("function_implementation.compute_annotations.storage", mock_storage)

    mocker.patch.object(
        compute_annotations,
        "COMPUTE_ANNOTATIONS_TIMEOUT_SEC",
        0,
    )

    async def delay(_user_provided_report, _uid, _file_name):
        await asyncio.sleep(1)

    mocked_compute_annotations = mocker.patch(
        "function_implementation.compute_annotations.__compute_annotations",
        side_effect=delay,
    )

    on_annotate_file_retrigger_impl(mock_request)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket_name, ANY
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
