#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from typing import Optional
from pydantic.dataclasses import dataclass


@dataclass
class DetailedResponse:
    main_explanation: str
    concept_question_1: Optional[str] = None
    concept_answer_1: Optional[str] = None
    concept_question_2: Optional[str] = None
    concept_answer_2: Optional[str] = None
