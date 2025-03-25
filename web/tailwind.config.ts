//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { tailwindColors } from "@stanfordspezi/spezi-web-design-system";
import { type Config } from "tailwindcss";
import tailwindCssAnimate from "tailwindcss-animate";

const tailwindConfig: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@stanfordspezi/spezi-web-design-system/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
  plugins: [tailwindCssAnimate],
};

export default tailwindConfig;
