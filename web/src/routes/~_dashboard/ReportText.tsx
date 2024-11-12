//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { groupCollapsed } from "console";
import { connectStorageEmulator } from "firebase/storage";
import { useState } from "react";

interface AnnotatedTextProps {
  userProvidedText: string;
  selectedFileName: string;
  textMapping: any;
  processed_annotations: string;
}

export default function ReportText({
  userProvidedText,
  selectedFileName,
  textMapping,
  processed_annotations,
}: AnnotatedTextProps) {
  const [currentHoveredWordIndex, setCurrentHoveredWordIndex] = useState<
    number | null
  >(null);

  const textArray = [];
  const groupMap = new Map();
  if (textMapping) {
    // console.log("jo")
    const map = new Map(
      Object.entries(textMapping).sort((a, b) => {
        if (+a === +b) return 0;
        if (+a < +b) return -1;
        return 1;
      }),
    );
    // console.log(map)
    // map.forEach((v, k, _) => { console.log(v); console.log(k) })

    let last_index = 0;
    for (const [key, value] of map) {
      const start = value.user_entered_text_start;
      const end = value.user_entered_text_end;
      textArray.push([null, userProvidedText.substring(last_index, start)]);
      textArray.push([+key, userProvidedText.substring(start, end)]);
      last_index = end;

      // processed_annotations.forEach(element => {
      //   console.log(element)
      // });
    }
    textArray.push(userProvidedText.substring(last_index));

    processed_annotations = JSON.parse(processed_annotations);
    console.log(processed_annotations);
    processed_annotations.forEach((o) => {
      const group = [];

      // observations
      const observation_start_indices = o["observation_start_ix"];
      const observation_end_indices = o["observation_end_ix"];
      for (const i in observation_start_indices) {
        const start = observation_start_indices[i];
        const end = observation_end_indices[i];

        for (let i = start; i <= end; i++) {
          group.push(i);
        }
      }

      // located at
      const located_at_start_indices = o["located_at_start_ix"];
      const located_at_end_indices = o["located_at_end_ix"];
      for (const j in located_at_start_indices) {
        const temp_start = located_at_start_indices[j];
        const temp_end = located_at_end_indices[j];
        for (const i in temp_start) {
          const start = temp_start[i];
          const end = temp_end[i];

          for (let ii = start; ii <= end; ii++) {
            group.push(ii);
          }
        }
      }

      for (const element of group) {
        groupMap.set(element, group);
      }
    });
    console.log(groupMap);
  }

  return (
    <>
      {currentHoveredWordIndex ?? "null"}
      <div className="whitespace-pre-wrap tracking-wide leading-5">
        {textArray.map(([k, s]) => (
          <span
            className={
              ((currentHoveredWordIndex ?? -1) > 0 &&
              (groupMap.get(k) ?? []).includes(currentHoveredWordIndex)
                ? "bg-green-300 transition-color cursor-pointer word-highlight"
                : "") +
              " " +
              (k && !(groupMap.get(k) ?? []).includes(currentHoveredWordIndex)
                ? "underline"
                : "")
            }
            onMouseEnter={() => setCurrentHoveredWordIndex(k)}
            onMouseLeave={() => setCurrentHoveredWordIndex(null)}
            onClick={() => {
              if (k === null) return;
              console.log(groupMap.get(k));
            }}
          >
            {s}
          </span>
        ))}
        {/* {textMapping} */}
        {/* {userProvidedText.split(" ").map((word, index) => (
          <>
            <span
              key={`${index}$${selectedFileName}`}
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
        ))} */}
      </div>
    </>
  );
}
