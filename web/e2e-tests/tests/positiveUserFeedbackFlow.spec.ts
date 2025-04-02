//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { test, expect } from "@playwright/test";
import {
  addNewReport,
  authenticateWithGoogle,
  checkForTextAnnotationCompletion,
  expectNoReports,
  GPT_TIMEOUT,
} from "../utils";

test("Test User Reporting Positive Feedback", async ({ page }) => {
  await authenticateWithGoogle(page);
  await expectNoReports(page);

  void (await addNewReport(page, {
    name: "Abdomen CT",
    content:
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.",
  }));
  await checkForTextAnnotationCompletion(page, /Study Type: CT Abdomen and/);

  const getUpload = (hasText: RegExp) =>
    page.locator("div").filter({ hasText }).nth(0);
  await expect(getUpload(/^Abdomen CT$/)).toBeVisible();
  await page.getByTestId("report-like").click();
  const positiveFeedbackDialog = page.getByRole("dialog", {
    name: "Feedback",
  });
  await positiveFeedbackDialog.getByText("This content feels safe and").click();
  await positiveFeedbackDialog.getByText("I understand everything").click();
  await positiveFeedbackDialog.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("The feedback has been")).toBeVisible();
  await expect(positiveFeedbackDialog).not.toBeVisible();
  await expect(page.getByTestId("report-like")).toHaveAccessibleName(
    "Liked answer",
  );
  await page.getByRole("button", { name: "normal" }).first().click();

  const conceptPopover = page.getByRole("dialog");
  await expect(
    conceptPopover.getByTestId("explanation-like").first(),
  ).toBeVisible({
    timeout: GPT_TIMEOUT,
  });
  await expect(page.getByTestId("explanation-like")).toHaveAccessibleName(
    "Like answer",
  );
  await page.getByTestId("explanation-like").first().click();
  await positiveFeedbackDialog
    .getByText("The explanation is clear and engaging")
    .click();
  await positiveFeedbackDialog.getByText("This page is so easy to use").click();
  await expect(
    positiveFeedbackDialog.getByText("The feedback has been"),
  ).not.toBeVisible();
  await positiveFeedbackDialog.getByRole("button", { name: "Submit" }).click();
  await expect(positiveFeedbackDialog).not.toBeVisible();
  await expect(
    conceptPopover.getByTestId("explanation-like"),
  ).toHaveAccessibleName("Liked answer");
  await expect(page.getByText("The feedback has been")).toBeVisible();
  await conceptPopover.getByTestId("question").nth(0).click();
  await expect(
    positiveFeedbackDialog.getByText("The feedback has been"),
  ).not.toBeVisible();
  await expect(positiveFeedbackDialog).not.toBeVisible();
  await expect(
    conceptPopover.getByTestId("question-like").first(),
  ).toHaveAccessibleName("Like answer");
  await conceptPopover.getByTestId("question-like").first().click();
  await positiveFeedbackDialog.locator("#userInputedAnswer").click();
  await positiveFeedbackDialog.locator("#userInputedAnswer").fill("Other");
  await positiveFeedbackDialog.getByRole("button", { name: "Submit" }).click();
  await expect(
    conceptPopover.getByTestId("question-like").first(),
  ).toHaveAccessibleName("Liked answer");
  await expect(page.getByText("The feedback has been")).toBeVisible();
});
