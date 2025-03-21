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
} from "../utils";

test("Test Upload and Deletion Flow", async ({ page }) => {
  await authenticateWithGoogle(page);
  await expect(page.getByText(/Please add or select a report./)).toBeVisible();

  await addNewReport(page, {
    name: "Abdomen CT",
    content:
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.",
  });
  await checkForTextAnnotationCompletion(page, /Study Type: CT Abdomen and/);

  const getUpload = (hasText: RegExp) =>
    page.locator("div").filter({ hasText }).nth(0);
  await expect(getUpload(/^Abdomen CT$/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Report issue" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Report issue" }).click();
  await page.getByText("The content is dangerous or").click();
  await page.getByText("The content is inaccurate or").click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("The issue report has been")).toBeVisible();
  await page.getByRole("button", { name: "normal" }).first().click();
  await expect(page.getByRole("button", { name: "Report issue" })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "Report issue" }).click();
  await page.getByText("The content is dangerous or").click();
  await page.getByText("The explanations or follow-up").click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("The issue report has been")).toBeVisible();
  await page.getByTestId("question").nth(0).click();
  await page.getByRole("button", { name: "Report issue" }).nth(1).click();
  await page.getByText("Other (please specify):").click();
  await page.locator("#userInputedIssue").click();
  await page.locator("#userInputedIssue").fill("Other");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("The issue report has been")).toBeVisible();
});
