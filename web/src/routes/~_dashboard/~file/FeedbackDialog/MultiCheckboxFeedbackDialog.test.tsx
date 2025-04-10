//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MultiCheckboxFeedbackDialog,
  UserFeedbackOrigin,
} from "./MultiCheckboxFeedbackDialog";

vi.mock("firebase/firestore", async (importOriginal) => ({
  ...(await importOriginal()),
  addDoc: vi.fn(),
  collection: vi.fn(),
}));

const uid = "testUID";

vi.mock("@/modules/firebase/app", () => ({
  getCurrentUser: () => ({
    uid,
  }),
}));

describe("Multi Checkbox Submission to Firestore Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const feedbackLabels = ["Issue 1", "Issue 2", "Issue 3"];
  const valuesOfIsOtherFilled = [true, false];
  const otherInputTestText = "other";

  const multiCheckboxFeedbackDialogProps = {
    checkboxLabels: feedbackLabels,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    collectionReference: {} as any,
    title: "",
    description: "",
    submitButtonText: "Submit",
    toastSuccessText: "",
    toastFailureText: "",
  };

  valuesOfIsOtherFilled.forEach((isOtherFilled) =>
    feedbackLabels.forEach((_, selectedFeedbackLabelIndex) =>
      it(`Select Single Element Selection ${selectedFeedbackLabelIndex} ${isOtherFilled ? "With" : "Without"} "Other"`, async () => {
        const userFeedbackContext = {
          report_id: "reportID",
          origin: UserFeedbackOrigin.QuestionAnswerLevel,
          question_index: 4,
          observation_index: 1,
        };
        render(
          <MultiCheckboxFeedbackDialog
            context={userFeedbackContext}
            {...multiCheckboxFeedbackDialogProps}
          >
            <button data-testid="testButton">Open</button>
          </MultiCheckboxFeedbackDialog>,
        );

        fireEvent.click(screen.getByTestId("testButton"));
        fireEvent.click(
          screen.getByTestId(`answerSelection.${selectedFeedbackLabelIndex}`),
        );
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() =>
          expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
            pre_defined_answers: [feedbackLabels[selectedFeedbackLabelIndex]],
            user_inputed_answer: null,
            user_id: uid,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            create_time: expect.anything(),
            ...userFeedbackContext,
          }),
        );
      }),
    ),
  );

  valuesOfIsOtherFilled.forEach((isOtherFilled) =>
    it(`All Elements Selection ${isOtherFilled ? "With" : "Without"} "Other"`, async () => {
      const userFeedbackContext = {
        report_id: "reportID",
        origin: UserFeedbackOrigin.QuestionAnswerLevel,
        question_index: 4,
        observation_index: 1,
      };
      render(
        <MultiCheckboxFeedbackDialog
          context={userFeedbackContext}
          {...multiCheckboxFeedbackDialogProps}
        >
          <button data-testid="testButton">Open</button>
        </MultiCheckboxFeedbackDialog>,
      );

      fireEvent.click(screen.getByTestId("testButton"));

      feedbackLabels.forEach((_, selectedFeedbackLabelIndex) =>
        fireEvent.click(
          screen.getByTestId(`answerSelection.${selectedFeedbackLabelIndex}`),
        ),
      );
      if (isOtherFilled) {
        fireEvent.change(screen.getByPlaceholderText("Please specify"), {
          target: { value: otherInputTestText },
        });
      }

      fireEvent.click(screen.getByText("Submit"));

      await waitFor(() => {
        expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
          pre_defined_answers: feedbackLabels,
          user_inputed_answer: isOtherFilled ? otherInputTestText : null,
          user_id: uid,
          report_id: "reportID",
          origin: UserFeedbackOrigin.QuestionAnswerLevel,
          question_index: 4,
          observation_index: 1,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          create_time: expect.anything(),
        });
      });
    }),
  );

  it(`Just Other Selected Test`, async () => {
    const userFeedbackContext = {
      report_id: "reportID",
      origin: UserFeedbackOrigin.QuestionAnswerLevel,
      question_index: 4,
      observation_index: 1,
    };
    render(
      <MultiCheckboxFeedbackDialog
        context={userFeedbackContext}
        {...multiCheckboxFeedbackDialogProps}
      >
        <button data-testid="testButton">Open</button>
      </MultiCheckboxFeedbackDialog>,
    );

    fireEvent.click(screen.getByTestId("testButton"));

    fireEvent.change(screen.getByPlaceholderText("Please specify"), {
      target: { value: otherInputTestText },
    });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
        pre_defined_answers: null,
        user_inputed_answer: otherInputTestText,
        user_id: uid,
        report_id: "reportID",
        origin: UserFeedbackOrigin.QuestionAnswerLevel,
        question_index: 4,
        observation_index: 1,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        create_time: expect.anything(),
      });
    });
  });
});
