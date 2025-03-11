//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type Functions, httpsCallable } from "@firebase/functions";
import {
  doc,
  type DocumentReference,
  type Firestore,
  getDoc,
  getDocs,
  type Query,
} from "firebase/firestore";
import { getCurrentUser } from "@/modules/firebase/app";

export interface OnDetailedExplanationRequestInput {
  file_name: string;
  observation_id: number;
}

interface OnDetailedExplanationRequestOutput {
  main_explanation: string;
  concept_based_question: string | null;
  concept_based_question_answer: string | null;
  concept_based_template_question: string | null;
  concept_based_template_question_answer: string | null;
}

export const getCallables = (functions: Functions) => ({
  onDetailedExplanationRequest: httpsCallable<
    OnDetailedExplanationRequestInput,
    OnDetailedExplanationRequestOutput
  >(functions, "on_detailed_explanation_request"),
});

export interface FilePayload {
  fileName: string;
}

export interface FeedbackPayload extends FilePayload {
  observationIndex: number;
}

const collections = {
  user: () => `users/${getCurrentUser().uid}`,
  file: (payload: FilePayload) => `${collections.user()}/${payload.fileName}`,
  feedback: (payload: FeedbackPayload) =>
    `${collections.file(payload)}/cached_answer_${payload.observationIndex}`,
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
});

export const getDocData = async <T>(reference: DocumentReference<T>) => {
  const doc = await getDoc(reference);
  const data = doc.data();
  return data ?
      {
        ...data,
        id: doc.id,
      }
    : undefined;
};

export const getDocDataOrThrow = async <T>(reference: DocumentReference<T>) => {
  const data = await getDocData(reference);
  if (!data) {
    throw new Error(`Doc not found: ${reference.path}`);
  }
  return data;
};

export const getDocsData = async <T>(query: Query<T>) => {
  const docs = await getDocs(query);
  return docs.docs.map((doc) => {
    const data = doc.data();
    if (!data) throw new Error(`No data for ${doc.id} ${doc.ref.path}`);
    return {
      ...data,
      id: doc.id,
    };
  });
};
