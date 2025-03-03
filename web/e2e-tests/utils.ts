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
