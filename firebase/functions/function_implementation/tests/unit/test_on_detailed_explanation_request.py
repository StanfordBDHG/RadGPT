#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import dataclasses
import json
from typing import Any
import pytest

from firebase_functions import https_fn

from function_implementation.llm_calling.detailed_reponse import (
    DetailedResponse,
)
from function_implementation.on_detailed_explanation_request import (
    __get_concept,
    on_detailed_explanation_request_impl,
)


def test_invalid_auth_object(mocker):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = None
    with pytest.raises(https_fn.HttpsError):
        on_detailed_explanation_request_impl(mock_request)


@pytest.mark.parametrize(
    "request_data",
    [
        {
            "file_name": file_name,
            "observation_index": observation_index,
        }
        for file_name in ["<file_name>", None]
        for observation_index in ["<observation_index>", None]
        if not (file_name is not None and observation_index is not None)
    ],
)
def test_invalid_request_data(mocker, request_data):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = request_data
    with pytest.raises(https_fn.HttpsError):
        on_detailed_explanation_request_impl(mock_request)


def test_return_cached_answer(mocker):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {
        "file_name": "<file_name>",
        "observation_index": "<observation_index>",
    }

    cached_answer = {"main_explanation": "test main explanation"}
    mock_cached_answer_document_snapshot = mocker.MagicMock()
    mock_cached_answer_document_snapshot.exists = True
    mock_cached_answer_document_snapshot.to_dict.return_value = cached_answer
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_cached_answer",
        return_value=mock_cached_answer_document_snapshot,
    )

    assert cached_answer == on_detailed_explanation_request_impl(mock_request)


def test_invalid_report_meta_data_file(mocker):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {
        "file_name": "<file_name>",
        "observation_index": "<observation_index>",
    }

    mock_cached_answer_document_snapshot = mocker.MagicMock()
    mock_cached_answer_document_snapshot.exists = False
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_cached_answer",
        return_value=mock_cached_answer_document_snapshot,
    )

    mock_report_meta_data_snapshot = mocker.MagicMock()
    mock_report_meta_data_snapshot.exists = False
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_report_meta_data",
        return_value=mock_report_meta_data_snapshot,
    )

    with pytest.raises(https_fn.HttpsError):
        on_detailed_explanation_request_impl(mock_request)


@pytest.mark.parametrize(
    "report_meta_data",
    [
        {
            "text_mapping": text_mapping,
            "user_provided_text": user_provided_test,
            "processed_annotations": processed_annotations,
        }
        for text_mapping in ["<text_mapping>", None]
        for user_provided_test in ["<user_provided_text>", None]
        for processed_annotations in ["<processed_annotations>", None]
        if not (
            text_mapping is not None
            and user_provided_test is not None
            and processed_annotations is not None
        )
    ],
)
def test_invalid_report_meta_data_content(mocker, report_meta_data):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {
        "file_name": "<file_name>",
        "observation_index": "<observation_index>",
    }

    mock_cached_answer_document_snapshot = mocker.MagicMock()
    mock_cached_answer_document_snapshot.exists = False
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_cached_answer",
        return_value=mock_cached_answer_document_snapshot,
    )

    mock_report_meta_data_snapshot = mocker.MagicMock()
    mock_report_meta_data_snapshot.exists = True
    mock_report_meta_data_snapshot.get = lambda x: report_meta_data.get(x)
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_report_meta_data",
        return_value=mock_report_meta_data_snapshot,
    )

    with pytest.raises(https_fn.HttpsError):
        on_detailed_explanation_request_impl(mock_request)


@pytest.mark.parametrize(
    "observation_index",
    [-1, None, 16, 50],
)
def test_invalid_observation_index(mocker, observation_index):
    mock_request = mocker.MagicMock()
    mock_request.auth.uid = "<uid>"
    mock_request.data = {
        "file_name": "<file_name>",
        "observation_index": observation_index,
    }

    mock_cached_answer_document_snapshot = mocker.MagicMock()
    mock_cached_answer_document_snapshot.exists = False
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_cached_answer",
        return_value=mock_cached_answer_document_snapshot,
    )

    report_meta_data = {
        "text_mapping": "<text_mapping>",
        "user_provided_text": "<user_provided_text>",
        "processed_annotations": json.dumps([{} for _ in range(16)]),
    }
    mock_report_meta_data_snapshot = mocker.MagicMock()
    mock_report_meta_data_snapshot.exists = True
    mock_report_meta_data_snapshot.get = lambda x: report_meta_data.get(x)
    mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_report_meta_data",
        return_value=mock_report_meta_data_snapshot,
    )

    with pytest.raises(https_fn.HttpsError):
        on_detailed_explanation_request_impl(mock_request)


@pytest.mark.parametrize(
    "observation_index",
    [i for i in range(16)],
)
def test_full_uncached_flow(mocker, observation_index):
    mock_request = mocker.MagicMock()
    uid = "<uid>"
    file_name = "<file_name>"
    mock_request.auth.uid = uid
    mock_request.data = {
        "file_name": file_name,
        "observation_index": observation_index,
    }

    mock_cached_answer_document_snapshot = mocker.MagicMock()
    mock_cached_answer_document_snapshot.exists = False
    mock_get_cached_answer_function = mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_cached_answer",
        return_value=mock_cached_answer_document_snapshot,
    )

    def get_numbered_processed_annotation(id: int) -> Any:
        return {
            "observation": f"observation {id}",
            "located_at": ["location 1", "location 2"],
            "suggestive_of": ["suggestion 1", "suggestion 2"],
        }

    user_provided_text = "<user_provided_text>"
    report_meta_data = {
        "text_mapping": "<text_mapping>",
        "user_provided_text": user_provided_text,
        "processed_annotations": json.dumps(
            [get_numbered_processed_annotation(i) for i in range(16)]
        ),
    }
    mock_report_meta_data_snapshot = mocker.MagicMock()
    mock_report_meta_data_snapshot.exists = True
    mock_report_meta_data_snapshot.get = lambda x: report_meta_data.get(x)
    mock_get_report_meta_data_function = mocker.patch(
        "function_implementation.on_detailed_explanation_request.__get_report_meta_data",
        return_value=mock_report_meta_data_snapshot,
    )

    concept = __get_concept(get_numbered_processed_annotation(observation_index))
    gpt_answer = DetailedResponse(
        main_explanation=f"main_explanation {concept}",
        concept_question_1=f"concept_based_question {concept}",
        concept_answer_1=f"concept_based_question_answer {concept}",
        concept_question_2=f"concept_based_template_question {concept}",
        concept_answer_2=f"concept_based_template_question_answer {concept}",
    )

    mock_request_gpt_function = mocker.patch(
        "function_implementation.on_detailed_explanation_request.request_gpt",
        return_value=gpt_answer,
    )

    mock_store_detailed_response_function = mocker.patch(
        "function_implementation.on_detailed_explanation_request.__store_detailed_response",
    )

    function_return_value = on_detailed_explanation_request_impl(mock_request)
    detailed_response = dataclasses.asdict(gpt_answer)
    assert function_return_value == detailed_response

    mock_get_report_meta_data_function.assert_called_with(uid, file_name)
    assert mock_get_report_meta_data_function.call_count == 1

    mock_get_cached_answer_function.assert_called_with(uid, file_name, observation_index)
    assert mock_get_cached_answer_function.call_count == 1

    mock_request_gpt_function.assert_called_with(user_provided_text, concept)
    assert mock_request_gpt_function.call_count == 1

    mock_store_detailed_response_function.assert_called_with(
        uid, file_name, observation_index, detailed_response
    )
    assert mock_store_detailed_response_function.call_count == 1
