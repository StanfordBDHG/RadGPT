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
} from "../utils";

test("Test Reporting Flow", async ({ page }) => {
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
  await expect(
    page.getByRole("button", { name: "Report issue" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Report issue" }).click();
  const reportIssueModal = page.getByRole("dialog", { name: "Issue Report" });
  await reportIssueModal.getByText("This content feels unsafe").click();
  await reportIssueModal.getByText("I am confused by").click();
  await reportIssueModal.getByRole("button", { name: "Report" }).click();
  await expect(page.getByText("The issue report has been")).toBeVisible();
  await expect(reportIssueModal).not.toBeVisible();
  await page.getByRole("button", { name: "normal" }).first().click();

  const conceptPopover = page.getByRole("dialog");
  await expect(
    conceptPopover.getByTestId("explanation-dislike").first(),
  ).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByTestId("explanation-dislike").locator("svg"),
  ).toHaveClass(/text-gray-300 hover:text-red-700/);
  await page.getByTestId("explanation-dislike").first().click();
  await reportIssueModal
    .getByText("I am not sure I understand the concept explanation")
    .click();
  await reportIssueModal
    .getByText("I am having trouble using this page")
    .click();
  await expect(
    reportIssueModal.getByText("The issue report has been"),
  ).not.toBeVisible();
  await reportIssueModal.getByRole("button", { name: "Report" }).click();
  await expect(reportIssueModal).not.toBeVisible();
  await expect(
    conceptPopover.getByTestId("explanation-dislike").locator("svg"),
  ).toHaveClass(/text-red-700/);
  await expect(page.getByText("The issue report has been")).toBeVisible();
  await conceptPopover.getByTestId("question").nth(0).click();
  await expect(
    reportIssueModal.getByText("The issue report has been"),
  ).not.toBeVisible();
  await expect(reportIssueModal).not.toBeVisible();

  await expect(
    conceptPopover.getByTestId("question-dislike").first().locator("svg"),
  ).toHaveClass(/text-gray-300 hover:text-red-700/);
  await conceptPopover.getByTestId("question-dislike").first().click();
  await reportIssueModal.locator("#userInputedAnswer").click();
  await reportIssueModal.locator("#userInputedAnswer").fill("Other");
  await reportIssueModal.getByRole("button", { name: "Report" }).click();
  await expect(
    conceptPopover.getByTestId("question-dislike").first().locator("svg"),
  ).toHaveClass(/text-red-700/);
  await expect(page.getByText("The issue report has been")).toBeVisible();
});
