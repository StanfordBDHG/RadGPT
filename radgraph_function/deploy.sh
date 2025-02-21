#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

gcloud functions deploy radgraph-http-function \
    --runtime=python310 \
    --region=us-central1 \
    --source=. \
    --entry-point=get_radgraph \
    --trigger-http \
    --memory=16GB \
    --no-allow-unauthenticated