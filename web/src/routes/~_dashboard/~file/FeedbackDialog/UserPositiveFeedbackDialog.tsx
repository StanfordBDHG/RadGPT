//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type ComponentProps } from "react";
import { collectionRefs } from "@/modules/firebase/app";
import { MultiCheckboxFeedbackDialog } from "./MultiCheckboxFeedbackDialog";

const positiveFeedbackLabels = [
  "This content feels safe and reassuring",
  "I understand everything well",
  "All the important details are here",
  "The explanation is clear and engaging",
  "The questions make sense",
  "This page is easy to use",
  "Everything is working smoothly",
];

type UserPositiveFeedbackDialogProps = Pick<
  ComponentProps<typeof MultiCheckboxFeedbackDialog>,
  "context" | "children"
>;

export const UserPositiveFeedbackDialog = (
  props: UserPositiveFeedbackDialogProps,
) => {
  return (
    <MultiCheckboxFeedbackDialog
      checkboxLabels={positiveFeedbackLabels}
      collectionReference={collectionRefs.usersPositiveFeedback()}
      title="Feedback"
      description="Please share what has been helpful or positive in your experience."
      submitButtonText="Submit"
      toastSuccessText="The feedback has been submitted! Thank you!"
      toastFailureText="An error occurred while submitting the feedback! Please try again later."
      {...props}
    />
  );
};
