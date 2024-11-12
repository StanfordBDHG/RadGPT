#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import sys
from traceback import print_tb
import traceback
from typing import Any, Dict, List, Tuple, TypeVar


# Searching for the entity matching the start_idx and returing their end index
# This is assuming that the start_idx is unique which is a fair assumption
# as the are token-based
def __get_end_ix_for_start_ix(radgraph_output: Dict[str, Any], start_idx: int) -> int:
    entities = radgraph_output["radgraph_annotations"]["0"]["entities"]
    for entity in entities:
        if entities[entity]["start_ix"] == start_idx:
            return entities[entity]["end_ix"]

    # Creating a traceback as this should never happen
    print(f"Matching end_idx not found for {start_idx}", file=sys.stderr)
    print_tb(traceback.extract_stack())
    return None


# In order to restore the missing located_at_end_ix, we are using the entities array of the
# raw radgraph output.
def add_end_ix_to_processed_annotations(
    processed_annotations: Dict[str, Any], radgraph_output: Dict[str, Any]
) -> List[List[int]]:
    for processed_annotation in processed_annotations:
        located_at_start_observations = processed_annotation["located_at_start_ix"]
        located_at_end_observations = []
        for located_at_start_observation in located_at_start_observations:
            end_indices = []
            for start_idx in located_at_start_observation:
                end_indices.append(
                    __get_end_ix_for_start_ix(radgraph_output, start_idx)
                )
            located_at_end_observations.append(end_indices)
        processed_annotation["located_at_end_ix"] = located_at_end_observations
    return processed_annotations


# Creating a dictionary that maps all tokens used by radgraph in the user-provided text to ranges
# in the user-provided text
def __map_all_token_entities_to_text_ranges(
    total_tokens: List[str], user_provided_text: str
) -> Dict[int, Tuple[int, int, str]]:
    total_entities_to_text_ranges_dict = {}

    text_pointer = 0
    for token_index, token in enumerate(total_tokens):
        while text_pointer < len(user_provided_text):
            next_text_pointer = 0

            while (
                next_text_pointer < len(token)
                and next_text_pointer + text_pointer < len(user_provided_text)
                and token[next_text_pointer]
                == user_provided_text[text_pointer + next_text_pointer]
            ):
                next_text_pointer += 1

            if next_text_pointer >= len(token):
                total_entities_to_text_ranges_dict[token_index] = (
                    text_pointer,
                    text_pointer + next_text_pointer,
                )

                text_pointer += next_text_pointer
                break
            text_pointer += 1
    return total_entities_to_text_ranges_dict


def __map_radgraph_relevant_token_entities_to_text_ranges(
    total_tokens: List[str],
    user_provided_text: str,
    radgraph_relevant_entities: List[Tuple[int, int]],
) -> Dict[int, Dict[str, int]]:
    total_entities_to_text_ranges_dict = __map_all_token_entities_to_text_ranges(
        total_tokens, user_provided_text
    )
    relevant_radgraph_entities_to_text_ranges_dict = {}
    for entity_start, entity_end in radgraph_relevant_entities:
        for token_index in range(entity_start, entity_end + 1):
            start_idx, end_idx = total_entities_to_text_ranges_dict[token_index]
            relevant_radgraph_entities_to_text_ranges_dict[token_index] = {
                "user_provided_text_start": start_idx,
                "user_provided_text_end": end_idx,
            }
    return relevant_radgraph_entities_to_text_ranges_dict


T = TypeVar("T")


def __flat(list_of_list: List[List[T]]) -> List[T]:
    return [item for list in list_of_list for item in list]


def get_entity_mapping_in_user_entered_text(
    user_provided_text: str, radgraph_output: Dict[str, Any]
) -> Dict[int, Dict[str, int]]:
    processed_annotations = add_end_ix_to_processed_annotations(
        radgraph_output["processed_annotations"], radgraph_output
    )

    radgraph_text = radgraph_output["radgraph_text"]
    total_tokens = radgraph_text.split(" ")
    observations = [
        (start_idx, end_idx)
        for processed_annotation in processed_annotations
        for start_idx, end_idx in zip(
            processed_annotation["observation_start_ix"],
            processed_annotation["observation_end_ix"],
        )
    ]
    relations = [
        (start_idx, end_idx)
        for processed_annotation in processed_annotations
        for start_idx, end_idx in zip(
            __flat(processed_annotation["located_at_start_ix"]),
            __flat(processed_annotation["located_at_end_ix"]),
        )
    ]

    # Removing duplicates
    radgraph_relevant_entities = list(set(observations + relations))

    radgraph_relevant_entities_to_text_ranges_mapping = (
        __map_radgraph_relevant_token_entities_to_text_ranges(
            total_tokens, user_provided_text, radgraph_relevant_entities
        )
    )
    return radgraph_relevant_entities_to_text_ranges_mapping
