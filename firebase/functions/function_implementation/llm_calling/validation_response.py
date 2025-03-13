#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from typing import Literal
from pydantic.dataclasses import dataclass


@dataclass
class ValidationResponse:
    is_valid_radiology_report: Literal["yes", "no"]
