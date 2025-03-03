//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type Functions, httpsCallable } from "@firebase/functions";

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
