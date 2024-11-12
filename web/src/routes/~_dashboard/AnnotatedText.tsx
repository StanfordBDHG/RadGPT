//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { StorageReference } from "firebase/storage";
import React from "react";

interface AnnotatedTextProps {
  currentHoveredWordIndex: number | null;
  annotation: string;
  selectedFile: StorageReference | null;
  setCurrentHoveredWordIndex: React.Dispatch<
    React.SetStateAction<number | null>
  >;
}

export default function AnnotatedText({
  currentHoveredWordIndex,
  annotation,
  selectedFile,
  setCurrentHoveredWordIndex,
}: AnnotatedTextProps) {
  return (
    <>
      {currentHoveredWordIndex ?? "null"}
      <div className="flex flex-row flex-wrap">
        {annotation.split(" ").map((word, index) => (
          <>
            <span
              key={`${index}$${selectedFile?.name}`}
              className={
                [29, 31, 33, 36].includes(currentHoveredWordIndex ?? -1) &&
                  [29, 31, 33, 36].includes(index)
                  ? "bg-green-300 transition-colors"
                  : ""
              }
              onMouseEnter={() => setCurrentHoveredWordIndex(index)}
              onMouseLeave={() =>
                setCurrentHoveredWordIndex((prev) =>
                  prev === index ? null : prev,
                )
              }
            >
              {word}
            </span>
            <span>&nbsp;</span>
          </>
        ))}
      </div>
    </>
  );
}
