#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import re

from firebase_admin import firestore
from firebase_functions import storage_fn


def on_report_meta_data_delete_impl(
    event: storage_fn.CloudEvent[storage_fn.StorageObjectData],
) -> None:
    match = re.match(
        r"^users/(?P<uid>[^/]+)/reports/(?P<file_name>[^/]+)$", event.data.name
    )
    if match is None:
        return
    uid = match.group("uid")
    file_name = match.group("file_name")

    db = firestore.client()
    docs = db.collection(f"users/{uid}/{file_name}").list_documents()
    for doc in docs:
        doc.delete()
