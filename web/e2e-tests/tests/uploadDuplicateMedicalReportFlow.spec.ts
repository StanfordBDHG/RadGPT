//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { test, expect } from "@playwright/test";
import { authenticateWithGoogle } from "../utils";

test("Test Duplicate Medical Report Upload", async ({ page }) => {
  await authenticateWithGoogle(page);
  await page.getByRole("button").first().click();
  await page.getByLabel("Name").fill("CT Abdomen");
  await page.getByLabel("Name").press("Tab");
  await page
    .getByLabel("Medical Report Content")
    .fill(
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract",
    );
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("button").first().click();
  await page
    .getByLabel("Medical Report Content")
    .fill(
      "Hypodense lesion is observed in the right hepatic lobe, measuring 2.5 cm and appearing non-enhancing on contrast-enhanced imaging, suggestive of a benign cyst.",
    );
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill("Hypodense Lesion");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("button").first().click();
  await page.getByLabel("Name").fill("CT Abdomen 1");
  await page.getByLabel("Name").press("Tab");
  await page
    .getByLabel("Medical Report Content")
    .fill(
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract",
    );
  await expect(page.getByText("Hypodense", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("This medical report has")).toBeVisible();
  await expect(
    page.getByText(
      "This medical report has already been uploaded. It has now been selected.",
    ),
  ).toBeVisible();
  await expect(page.locator("#root")).toContainText(
    "Study Type: CT Abdomen and Pelvis Indication: Evaluation for kidney stones due to symptoms of flank pain and hematuria. Findings: The kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter. In the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall. Impression: Small non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary. No other abnormalities detected in the kidneys or urinary tract",
  );
  await expect(
    page
      .getByRole("complementary")
      .getByText("CT AbdomenHypodense LesionSign out"),
  ).toMatchAriaSnapshot(`
      - text: CT Abdomen
      - img
      - text: Hypodense Lesion
      - img
      - button "Sign out"
      `);
});
