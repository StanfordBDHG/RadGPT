//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  collection,
  doc,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";

export interface UserPayload {
  userId: string;
}

export interface FilePayload extends UserPayload {
  fileName: string;
}

export interface FeedbackPayload extends FilePayload {
  observationIndex: number;
}

export const collections = {
  user: (payload: UserPayload) => `users/${payload.userId}`,
  usersReportedIssues: () => `users_reported_issues`,
  file: (payload: FilePayload) =>
    `${collections.user(payload)}/${payload.fileName}`,
  feedback: (payload: FeedbackPayload) =>
    `${collections.file(payload)}/cached_answer_${payload.observationIndex}`,
  fileMetaData: (payload: FilePayload) =>
    `${collections.file(payload)}/report_meta_data`,
  reports: (payload: UserPayload) => `${collections.user(payload)}/reports`,
};

interface Feedback {
  feedback: {
    like1: boolean | null;
    like2: boolean | null;
    dislike1: boolean | null;
    dislike2: boolean | null;
    textFeedback1: string | null;
    textFeedback2: string | null;
  };
}

export const getDocumentsRefs = (db: Firestore) => ({
  feedback: (payload: FeedbackPayload) =>
    doc(db, collections.feedback(payload)) as DocumentReference<
      Feedback,
      Feedback
    >,
  fileMetaData: (payload: FilePayload) =>
    doc(db, collections.fileMetaData(payload)),
});

export const getCollectionRefs = (db: Firestore) => ({
  usersReportedIssues: () => collection(db, collections.usersReportedIssues()),
});
