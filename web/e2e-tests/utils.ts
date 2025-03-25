//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { createHash } from "crypto";
import { type Page, expect } from "@playwright/test";

export const authenticateWithGoogle = async (page: Page) => {
  await page.goto("/signin?redirect=%2F");
  const page1Promise = page.waitForEvent("popup");
  await page.waitForLoadState();
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  const page1 = await page1Promise;
  await page1.waitForLoadState();
  await page1.getByRole("button", { name: "Add new account" }).click();
  await page1
    .getByRole("button", { name: "Auto-generate user information" })
    .click();
  await page1.getByRole("button", { name: "Sign in with Google.com" }).click();
  await page.waitForURL("/");
};

export const expectNoReports = async (page: Page) => {
  await expect(page.getByText(/No reports found./).first()).toBeVisible();
};

export const calculateSHA256Hash = (content: string) =>
  createHash("sha256").update(content).digest("hex");

export const addNewReport = async (
  page: Page,
  content: { name: string; content: string },
) => {
  await page
    .getByRole("button", { name: /Add New Report/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill(content.name);
  await dialog.getByLabel("Medical Report Content").fill(content.content);
  await dialog.getByRole("button", { name: "Add report" }).click();
  await expect(page.getByLabel("Medical Report Content")).not.toBeVisible();
  await page.waitForURL(`/file/${calculateSHA256Hash(content.content)}`);
};

export const checkForTextAnnotationCompletion = async (
  page: Page,
  title: string | RegExp,
) => {
  await expect(page.getByText(title)).toBeVisible();

  await expect(page.getByPlaceholder("Send us feedback")).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator("form")).toBeVisible();
};
