#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from function_implementation.llm_calling.chatgpt import request_gpt
from function_implementation.llm_calling.detailed_reponse import (
    DetailedResponse,
)


def test(mocker):
    gpt_return_value = "mock answer"
    mock_gpt_answer = mocker.MagicMock()
    mock_gpt_answer.choices[0].message.content = gpt_return_value
    mock_completions_with_backoff_function = mocker.patch(
        "function_implementation.llm_calling.chatgpt.__completions_with_backoff",
        return_value=mock_gpt_answer,
    )

    user_observation = "user observation"
    user_provided_report = "user provided report"
    gpt_answer = request_gpt(user_provided_report, user_observation)

    assert mock_completions_with_backoff_function.call_count == 4

    def get_expected_prompt_parameters(prompt):
        return {
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0,
            "n": 1,
            "model": "gpt-4-0125-preview",
        }

    expected_explanation_prompt = f"""Explain in 3 sentences or less the concept "{user_observation}" at a 5th grade reading level given the following context: "{user_provided_report}". Do not discuss symptoms or treatment."""
    mock_completions_with_backoff_function.assert_any_call(
        **get_expected_prompt_parameters(expected_explanation_prompt)
    )

    expected_concept_based_template_question = f"What is {user_observation}?"
    expected_concept_question_prompt = f"""Answer in 3 sentences or less the question "{expected_concept_based_template_question}" at a 5th grade reading level given the following context: "{user_provided_report}". Do not discuss symptoms or treatment."""
    mock_completions_with_backoff_function.assert_any_call(
        **get_expected_prompt_parameters(expected_concept_question_prompt)
    )

    expected_question_generation_prompt = f"""Generate exactly 1 question a patient would ask about this medical explanation: "{gpt_return_value}". Do not ask about symptoms or treatment."""
    mock_completions_with_backoff_function.assert_any_call(
        **get_expected_prompt_parameters(expected_question_generation_prompt)
    )

    expected_gpt_generated_question_prompt = f"""Answer in 3 sentences or less the question "{gpt_return_value}" at a 5th grade reading level given the following context: "{user_provided_report}". Do not discuss symptoms or treatment."""
    mock_completions_with_backoff_function.assert_any_call(
        **get_expected_prompt_parameters(expected_gpt_generated_question_prompt)
    )

    expected_gpt_answer = DetailedResponse(
        main_explanation=gpt_return_value,
        concept_based_question=gpt_return_value,
        concept_based_question_answer=gpt_return_value,
        concept_based_template_question=expected_concept_based_template_question,
        concept_based_template_question_answer=gpt_return_value,
    )
    assert expected_gpt_answer == gpt_answer
