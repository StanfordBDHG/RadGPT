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

test("Test Upload and GPT Detailed Information Flow", async ({ page }) => {
  test.setTimeout(60_000);
  await authenticateWithGoogle(page);

  void (await addNewReport(page, {
    name: "Medical Report",
    content:
      "\nStudy Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\n\nFindings:\n\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\n\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\n\nImpression:\n\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.",
  }));
  await checkForTextAnnotationCompletion(page, /Study Type: CT Abdomen and/);

  await page.getByText("Small", { exact: true }).click({ timeout: 60_000 });
  const popover = page.getByRole("dialog");
  await expect(
    popover.getByRole("heading", { name: "Detailed Explanation" }),
  ).toBeVisible();
  await expect(
    popover.getByRole("heading", { name: "Other questions you may have" }),
  ).toBeVisible({ timeout: 30_000 });
  await popover.getByTestId("question").nth(0).click();
  await popover.getByPlaceholder("Feedback").first().fill("Great question!");
  await popover
    .getByRole("button", { name: "Submit feedback" })
    .first()
    .click();
  await popover.getByTestId("question").nth(1).click();
  await expect(popover.getByPlaceholder("Feedback").nth(1)).not.toContainText(
    "Great question!",
  );
});
