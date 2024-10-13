//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/second")({
  component: () => (
    <div className="h-full">
      <h1 className="text-3xl">Hello from Second!</h1>
    </div>
  ),
});
