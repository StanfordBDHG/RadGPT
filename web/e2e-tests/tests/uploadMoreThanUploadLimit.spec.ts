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

const MAX_UPLOAD_LIMIT = 5;

test("Test Upload Above Upload Limiting", async ({ page }) => {
  await authenticateWithGoogle(page);
  for (let i = 0; i < MAX_UPLOAD_LIMIT; i++) {
    const reportContent =
      `Report ${i}:\n` +
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.";
    await addNewReport(page, {
      name: `Abdomen CT ${i}`,
      content: reportContent,
    });
    await checkForTextAnnotationCompletion(page, `Report ${i}`);
  }
  const reportContent =
    `Report ${MAX_UPLOAD_LIMIT}:\n` +
    "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.";
  await addNewReport(page, {
    name: `Abdomen CT ${MAX_UPLOAD_LIMIT}`,
    content: reportContent,
  });
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("alert")).toContainText(
    "You have reached your limit for radiology report uploads. In case you believe this is a mistake or if you want to file for an exemption, please send a brief email to",
  );
});
