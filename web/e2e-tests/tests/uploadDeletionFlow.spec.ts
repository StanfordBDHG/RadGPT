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

test("Test Upload and Deletion Flow", async ({ page }) => {
  await authenticateWithGoogle(page);
  await expectNoReports(page);

  await addNewReport(page, {
    name: "Abdomen CT",
    content:
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.",
  });
  await checkForTextAnnotationCompletion(page, /Study Type: CT Abdomen and/);

  await addNewReport(page, {
    name: "Hypodense Lesion",
    content:
      "Hypodense lesion is observed in the right hepatic lobe, measuring 2.5 cm and appearing non-enhancing on contrast-enhanced imaging, suggestive of a benign cyst.",
  });
  await checkForTextAnnotationCompletion(page, "Hypodense lesion is observed");

  const getUpload = (hasText: RegExp) =>
    page.locator("div").filter({ hasText }).nth(0);
  await expect(getUpload(/^Abdomen CT$/)).toBeVisible();
  await expect(getUpload(/^Hypodense Lesion$/)).toBeVisible();
  await getUpload(/^Hypodense Lesion$/)
    .getByLabel("Delete")
    .click();
  await page.waitForURL("/");

  await expect(getUpload(/^Hypodense Lesion$/)).not.toBeVisible();
  await expect(getUpload(/^Abdomen CT$/)).toBeVisible();
  await getUpload(/^Abdomen CT$/)
    .getByLabel("Delete")
    .click();
  await expect(getUpload(/^Hypodense Lesion$/)).not.toBeVisible();
  await expect(getUpload(/^Abdomen CT$/)).not.toBeVisible();
  await expect(page.getByText("No reports found.").first()).toBeVisible();
  await page.getByTestId("user-menu").first().click();
  await expect(page.getByText("Sign Out")).toBeVisible();
});
