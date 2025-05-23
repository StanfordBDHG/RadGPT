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
from google.cloud.firestore_v1.base_query import FieldFilter


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

    remove_data_associated_to_file(uid, file_name)


def remove_data_associated_to_file(uid: str, file_name: str) -> None:
    db = firestore.client()
    medical_report_docs_query = db.collection(f"users/{uid}/{file_name}")
    issue_report_query = (
        db.collection("users_reported_issues")
        .where(filter=FieldFilter("user_id", "==", uid))
        .where(filter=FieldFilter("report_id", "==", file_name))
    )
    positive_feedback_query = (
        db.collection("users_positive_feedback")
        .where(filter=FieldFilter("user_id", "==", uid))
        .where(filter=FieldFilter("report_id", "==", file_name))
    )

    @firestore.transactional
    def delete_documents(transaction):
        issue_reports = issue_report_query.get(transaction=transaction)
        positive_feedback = positive_feedback_query.get(transaction=transaction)
        medical_report_docs = medical_report_docs_query.get(transaction=transaction)

        for doc in medical_report_docs:
            transaction.delete(doc.reference)
        for doc in issue_reports:
            transaction.delete(doc.reference)
        for doc in positive_feedback:
            transaction.delete(doc.reference)

    delete_documents(db.transaction())
