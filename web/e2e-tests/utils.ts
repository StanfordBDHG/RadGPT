//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type Page } from "@playwright/test";

export const authenticateWithGoogle = async (page: Page) => {
  await page.goto("/signin?redirect=%2F");
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  const page1 = await page1Promise;
  await page1.getByRole("button", { name: "Add new account" }).click();
  await page1
    .getByRole("button", { name: "Auto-generate user information" })
    .click();
  await page1.getByRole("button", { name: "Sign in with Google.com" }).click();
  await page.waitForURL("/");
};

export const addNewReport = async (
  page: Page,
  content: { name: string; content: string },
) => {
  await page.getByRole("button", { name: /Add New Report/ }).click();
  await page.getByLabel("Name").fill(content.name);
  await page.getByLabel("Medical Report Content").fill(content.content);
  await page.getByRole("button", { name: "Submit" }).click();
};
