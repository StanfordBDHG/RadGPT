//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("./signin?redirect=%2F");
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  const page1 = await page1Promise;
  await page1.getByRole("button", { name: "Add new account" }).click();
  await page1
    .getByRole("button", { name: "Auto-generate user information" })
    .click();
  await page1.getByRole("button", { name: "Sign in with Google.com" }).click();
  await page.waitForURL("./");
  await page.getByRole("button").first().click();
  await page.getByLabel("Name").fill("Medical Report");
  await page.getByLabel("Name").press("Tab");
  await page.getByLabel("Medical Report Content").click();
  await page
    .getByLabel("Medical Report Content")
    .fill(
      "\nStudy Type: CT Abdomen and Pelvis\nIndication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.\n\nFindings:\n\nThe kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.\n\nIn the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.\n\nImpression:\n\nSmall non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.\nNo other abnormalities detected in the kidneys or urinary tract.",
    );
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByText("Small", { exact: true }).click({ timeout: 60_000 });
  await expect(page.getByRole("heading")).toContainText("Detailed Explanation");
  await expect(page.getByLabel("Detailed Explanation")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Other questions you may have" }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("h3")).toContainText(
    "Other questions you may have",
  );
  await page.locator(".cursor-pointer > .lucide").first().click();
  await expect(page.getByLabel("Detailed Explanation")).toMatchAriaSnapshot(`
    - img
    - img
    - textbox "Feedback"
    - button "Submit"
    `);
  await page.getByPlaceholder("Feedback").first().click();
  await page.getByPlaceholder("Feedback").first().fill("Great question!");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await page
    .locator("div")
    .filter({ hasText: /^What is small non - obstructing calculus bladder\?$/ })
    .getByRole("img")
    .click();
  await expect(page.getByLabel("Detailed Explanation")).toMatchAriaSnapshot(`
    - img
    - img
    - textbox "Feedback"
    - button "Submit"
    `);
});
