//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { test, expect } from "@playwright/test";

test("Test Upload and Deletion Flow", async ({ page }) => {
  await page.goto("./signin?redirect=%2F");
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  const page1 = await page1Promise;
  await page1.getByRole("button", { name: "Add new account" }).click();
  await page1
    .getByRole("button", { name: "Auto-generate user information" })
    .click();
  await page1.getByRole("button", { name: "Sign in with Google.com" }).click();
  await expect(
    page.locator("div").filter({ hasText: /^Please add or select a file$/ }),
  ).toBeVisible();
  await page.getByRole("button").first().click();
  await page.getByLabel("Name").fill("Abdomen CT");
  await page.getByLabel("Name").press("Tab");
  await page
    .getByLabel("Medical Report Content")
    .fill(
      "Study Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\nFindings:\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\nImpression:\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.",
    );
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: "Study Type: CT Abdomen and" })
      .nth(2),
  ).toBeVisible();
  await expect(page.getByText("FeedbackSubmit")).toBeVisible();
  await page.getByRole("button").first().click();
  await page.getByLabel("Name").fill("Hypodense Lesion");
  await page.getByLabel("Medical Report Content").click();
  await page
    .getByLabel("Medical Report Content")
    .fill(
      "Hypodense lesion is observed in the right hepatic lobe, measuring 2.5 cm and appearing non-enhancing on contrast-enhanced imaging, suggestive of a benign cyst.",
    );
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Hypodense lesion is observed")).toBeVisible();
  await page.getByText("FeedbackSubmit").click();
  await expect(page.getByText("FeedbackSubmit")).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Abdomen CT$/ })
      .nth(0),
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Hypodense Lesion$/ })
      .nth(0),
  ).toBeVisible();
  await page
    .locator("div")
    .filter({ hasText: /^Abdomen CT$/ })
    .nth(0)
    .locator("a > .lucide")
    .click();
  await expect(
    page.locator("div").filter({ hasText: /^Abdomen CT$/ }),
  ).toHaveCount(0);
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Hypodense Lesion$/ })
      .nth(0),
  ).toBeVisible();
  await page
    .locator("div")
    .filter({ hasText: /^Hypodense Lesion$/ })
    .nth(0)
    .locator("a > .lucide")
    .click();
  await expect(
    page.locator("div").filter({ hasText: /^Abdomen CT$/ }),
  ).toHaveCount(0);
  await expect(
    page.locator("div").filter({ hasText: /^Hypodense Lesion$/ }),
  ).toHaveCount(0);
  await expect(
    page.locator("div").filter({ hasText: "Sign out" }).nth(2),
  ).toBeVisible();
});
