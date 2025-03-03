#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import backoff
from openai import APIError, OpenAI, RateLimitError

from function_implementation.llm_calling.detailed_reponse import DetailedResponse


@backoff.on_exception(backoff.expo, (RateLimitError, APIError))
def __completions_with_backoff(**kwargs):  # pragma: no cover
    client = OpenAI()
    return client.chat.completions.create(**kwargs)


def __call_chatGPT(prompt, temperature, n, model="gpt-3.5-turbo"):
    return __completions_with_backoff(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        n=n,
    )


def __get_concept_explanation(report: str, user_observation: str):
    explanation_prompt = f"""Explain in 3 sentences or less the concept "{user_observation}" at a 5th grade reading level given the following context: "{report}". Do not discuss symptoms or treatment."""

    main_explanation = (
        __call_chatGPT(
            prompt=explanation_prompt,
            temperature=0,
            n=1,
            model="gpt-4-0125-preview",
        )
        .choices[0]
        .message.content
    )

    return main_explanation


def __get_LLM_generated_answer(report: str, question: str) -> str:
    answer_prompt = f"""Answer in 3 sentences or less the question "{question}" at a 5th grade reading level given the following context: "{report}". Do not discuss symptoms or treatment."""
    answer = (
        __call_chatGPT(
            prompt=answer_prompt,
            temperature=0,
            n=1,
            model="gpt-4-0125-preview",
        )
        .choices[0]
        .message.content
    )
    return answer


def __get_concept_based_LLM_generated_question_answer(
    report: str, main_explanation: str
):
    question_prompt = f"""Generate exactly 1 question a patient would ask about this medical explanation: "{main_explanation}". Do not ask about symptoms or treatment."""
    question = (
        __call_chatGPT(
            prompt=question_prompt,
            temperature=0,
            n=1,
            model="gpt-4-0125-preview",
        )
        .choices[0]
        .message.content
    )
    answer = __get_LLM_generated_answer(report, question)
    return question, answer


def __get_concept_based_templated_question_answer(report, concept):
    question = f"What is {concept}?"
    answer = __get_LLM_generated_answer(report, question)
    return question, answer


def request_gpt(report: str, user_observation: str) -> DetailedResponse:
    main_explanation = "A \"small non-obstructing calculus bladder\" means there is a tiny stone in the bladder that isn't blocking anything or causing problems. It's just sitting there and not hurting the bladder. The doctors found it on a special picture of the inside of the body, but it doesn't need to be fixed right away."

    concept_based_question = "How did the stone end up in my bladder if it's not causing any symptoms or problems?",
    concept_based_question_answer = "Sometimes, small stones can travel down from the kidney into the bladder without causing any pain or problems. If the stone doesn't block urine flow or irritate the bladder, you might not feel it. It's like having a tiny pebble in your shoe that sits in a spot where you can't feel it."

    concept_based_template_question = "What is small non - obstructing calculus bladder?"

    concept_based_template_question_answer = "A small non-obstructing calculus in the bladder is like a tiny pebble found inside your bladder that isn't blocking anything. It's just sitting there and not causing any problems right now. The doctors found it during a special picture-taking test of your belly, but everything else looked okay."

    return DetailedResponse(
        main_explanation=main_explanation,
        concept_based_question=concept_based_question,
        concept_based_question_answer=concept_based_question_answer,
        concept_based_template_question=concept_based_template_question,
        concept_based_template_question_answer=concept_based_template_question_answer,
    )
