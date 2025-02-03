//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type Config } from "tailwindcss";

const tailwindConfig: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@stanfordspezi/spezi-web-design-system/dist/**/*.js",
  ],
  plugins: [],
};

export default tailwindConfig;
