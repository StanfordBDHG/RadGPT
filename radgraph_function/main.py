#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import functions_framework

from radgraph import RadGraph, get_radgraph_processed_annotations

model = RadGraph(
    model_type="radgraph-xl",
    model_cache_dir="./",
    tokenizer_cache_dir="./",
)


@functions_framework.http
def get_radgraph(request):
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and "report" in request_json:
        report = request_json["report"]
    elif request_args and "name" in request_args:
        report = request_args["report"]
    else:
        return "Missing report for radgraph", 400
    annotations = model([report])
    return get_radgraph_processed_annotations(annotations)
