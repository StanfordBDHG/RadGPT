#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import os
import requests
from google.oauth2 import id_token
from google.auth.transport.requests import Request

EMULATED_FUNCTION_URL = "http://localhost:5002"
RADGRAPH_FUNCTION_URL = "https://us-central1-radgpt-development-setup.cloudfunctions.net/radgraph-http-function"


def get_processed_annotation_from_radgraph(user_report: str):
    payload = {"report": user_report}
    if os.environ.get("RADGRAPH_EMULATED"):
        response = requests.post(EMULATED_FUNCTION_URL, json=payload)
    else:
        token = id_token.fetch_id_token(Request(), RADGRAPH_FUNCTION_URL)
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(RADGRAPH_FUNCTION_URL, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()
