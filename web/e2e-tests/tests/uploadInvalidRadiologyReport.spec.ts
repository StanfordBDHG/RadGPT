//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { test, expect } from "@playwright/test";
import { addNewReport, authenticateWithGoogle } from "../utils";

test("Test Invalid Radiology Report Upload", async ({ page }) => {
  await authenticateWithGoogle(page);
  await addNewReport(page, {
    name: "Not a Radiology Report",
    content:
      'The Equation of Everything\n\nDr. Elias Carter stared at the board, his chalk-streaked fingers trembling. The equation was almost complete—a bridge between quantum mechanics and relativity. The fabled "Theory of Everything."\n\nFor centuries, physicists sought a unifying law, a mathematical truth that could explain the forces of nature, from the dance of galaxies to the spin of electrons. Elias had spent his life pursuing this dream, lost in numbers, driven by an obsession that had cost him friendships, love, and time itself.\n\nHis breakthrough had come unexpectedly, in a dream. He saw the universe as a vast tensor field, woven together by geometric symmetries beyond human intuition. Waking up, he scrawled the final term onto the board.\n\nThe room trembled. Space itself seemed to ripple. The symbols burned into his mind as if they had always been there, waiting to be written.\n\nA sudden realization struck him—the equation didn’t just describe reality; it was reality. By solving it, he had rewritten the cosmos itself.\n\nA light enveloped him, and he felt himself dissolving, merging into the fabric of existence, becoming the very mathematics he had once sought to understand.\n\nAnd then—nothing.\n\nOnly the equation remained.',
  });
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("alert")).toContainText(
    "This report could not be identified as a radiology report. In case you believe this is a mistake, please send a brief email to",
  );
});
