#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from dataclasses import dataclass
from typing import Optional


@dataclass
class DetailedResponse:
    main_explanation: str
    concept_based_question: Optional[str] = None
    concept_based_question_answer: Optional[str] = None
    concept_based_template_question: Optional[str] = None
    concept_based_template_question_answer: Optional[str] = None
