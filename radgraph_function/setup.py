#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from radgraph import RadGraph

model = RadGraph(
    model_type="radgraph-xl",
    model_cache_dir="./",
    tokenizer_cache_dir="./",
)
