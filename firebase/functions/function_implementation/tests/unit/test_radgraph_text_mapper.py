#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#


import json

from function_implementation.text_mapping.radgraph_text_mapper import (
    __get_end_ix_for_start_ix,
)


def test():
    example_radgraph_annotations = json.loads(
        """{"radgraph_annotations": {"0": {"entities": {"1": {"tokens": "kidneys", "label": "Anatomy::definitely present", "start_ix": 25, "end_ix": 25, "relations": []}, "2": {"tokens": "normal", "label": "Observation::definitely present", "start_ix": 27, "end_ix": 27, "relations": [["located_at", "3"], ["located_at", "4"], ["located_at", "5"]]}}}}}"""
    )

    __get_end_ix_for_start_ix(example_radgraph_annotations, 0)
