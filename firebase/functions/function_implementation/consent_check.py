#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

from firebase_admin import firestore


def has_consent(uid: str) -> bool:
    db = firestore.client()
    consent_doc_ref = db.document(f"user_consent/{uid}").get()
    return consent_doc_ref.exists
