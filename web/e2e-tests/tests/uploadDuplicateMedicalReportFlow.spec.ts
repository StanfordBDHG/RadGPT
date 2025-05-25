//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { test, expect } from "@playwright/test";
import {
  acceptLegalDisclaimer,
  addNewReport,
  authenticateWithGoogle,
  checkForTextAnnotationCompletion,
} from "../utils";

test("Test Duplicate Medical Report Upload", async ({ page }) => {
  await authenticateWithGoogle(page);
  await acceptLegalDisclaimer(page);

  const duplicateReportContent =
    "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract";

  const duplicateReportFirstUploadURL = await addNewReport(page, {
    name: "CT Abdomen",
    content: duplicateReportContent,
  });
  await checkForTextAnnotationCompletion(
    page,
    "Study Type: CT Abdomen and Pelvis",
  );

  void (await addNewReport(page, {
    name: "Hypodense Lesion",
    content:
      "Hypodense lesion is observed in the right hepatic lobe, measuring 2.5 cm and appearing non-enhancing on contrast-enhanced imaging, suggestive of a benign cyst.",
  }));
  await checkForTextAnnotationCompletion(
    page,
    "Hypodense lesion is observed in the",
  );

  const duplicateReportSecondUploadURL = await addNewReport(page, {
    name: "Duplicated Report",
    content: duplicateReportContent,
  });
  await expect(
    page.getByText(
      "This medical report has already been uploaded. It has now been selected.",
    ),
  ).toBeVisible();

  expect(duplicateReportSecondUploadURL).toEqual(
    duplicateReportSecondUploadURL,
  );
  await page.waitForURL(duplicateReportFirstUploadURL);
  await expect(page.locator("#root")).toContainText(
    "Study Type: CT Abdomen and Pelvis Indication: Evaluation for kidney stones due to symptoms of flank pain and hematuria. Findings: The kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter. In the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall. Impression: Small non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary. No other abnormalities detected in the kidneys or urinary tract",
  );
  await expect(page.getByText("Duplicated Report")).not.toBeVisible();
  await checkForTextAnnotationCompletion(
    page,
    "Study Type: CT Abdomen and Pelvis",
  );
});
