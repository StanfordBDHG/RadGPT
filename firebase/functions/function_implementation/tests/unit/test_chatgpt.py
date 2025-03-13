#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from function_implementation.llm_calling.chatgpt import (
    SYSTEM_PROMPT_DETAILED_ANSWER,
    request_gpt,
)
from function_implementation.llm_calling.detailed_reponse import (
    DetailedResponse,
)


def test(mocker):
    mock_detailed_response = DetailedResponse(
        main_explanation="concept_based_question",
        concept_question_1="main_explanation",
        concept_answer_1="concept_based_template_question",
        concept_question_2="concept_based_question_answer",
        concept_answer_2="concept_based_template_question_answer",
    )
    mock_gpt_answer = mocker.MagicMock()
    mock_gpt_answer.choices[0].message.parsed = mock_detailed_response
    mock_completions_with_backoff_function = mocker.patch(
        "function_implementation.llm_calling.chatgpt.__completions_with_backoff",
        return_value=mock_gpt_answer,
    )

    user_observation = "user observation"
    user_provided_report = "user provided report"
    gpt_answer = request_gpt(user_provided_report, user_observation)

    assert mock_completions_with_backoff_function.call_count == 1

    expected_prompt_parameters = {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT_DETAILED_ANSWER},
            {
                "role": "user",
                "content": f'''medical report: """{user_provided_report}"""
medical concept: """{user_observation}"""''',
            },
        ],
        "temperature": 0,
        "n": 1,
        "model": "gpt-4o-2024-08-06",
        "response_format": DetailedResponse,
    }

    mock_completions_with_backoff_function.assert_any_call(**expected_prompt_parameters)

    assert mock_detailed_response == gpt_answer
