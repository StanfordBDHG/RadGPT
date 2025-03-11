#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import backoff
from openai import NOT_GIVEN, APIError, OpenAI, RateLimitError

from function_implementation.llm_calling.detailed_reponse import DetailedResponse


SYSTEM_PROMPT = """You are a helpful assistant that generates medical concept explanations as well as questions and answers. 
Use the medical report and the medical concept specified by the user to fullfil the following tasks:
- Explain in 3 sentences or less the concept at a 5th grade reading level given the given context. Do not discuss symptoms or treatment.
- Generate exactly 2 question a patient would ask about the just generated medical explanation. Do not ask about symptoms or treatment. Also do not ask a question that was already answered by the concept explanation.
- Answer in 3 sentences or less each of the question at a 5th grade reading level given the given context. Do not discuss symptoms or treatment.

The given format should be returned. The first question will be referred to as "concept_question_1" and the second one as "concept_question_2"."""


@backoff.on_exception(backoff.expo, (RateLimitError, APIError))
def __completions_with_backoff(**kwargs):  # pragma: no cover
    client = OpenAI()
    return client.beta.chat.completions.parse(**kwargs)


def __call_chatGPT(
    prompt, temperature, n, model="gpt-3.5-turbo", response_format=NOT_GIVEN
):
    return __completions_with_backoff(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        n=n,
        response_format=response_format,
    )


def request_gpt(report: str, user_observation: str) -> DetailedResponse:
    prompt = f'''medical report: """{report}"""
medical concept: """{user_observation}"""'''
    return (
        __call_chatGPT(prompt, 0, 1, "gpt-4o-2024-08-06", DetailedResponse)
        .choices[0]
        .message.parsed
    )
