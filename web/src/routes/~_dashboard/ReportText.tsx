//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { useState } from "react";

interface AnnotatedTextProps {
  userProvidedText: string;
  selectedFileName: string;
  textMapping: {
    [id: number]: {
      "user_provided_text_start": number,
      "user_provided_text_end": number
    }
  }
  processed_annotations: string
  // processed_annotations: {
  //   "observation": string,
  //   "observation_start_ix": number[],
  //   "located_at": string[],
  //   "located_at_start_ix": number[][],
  //   "tags": string[],
  //   "suggestive_of": string | null,
  //   "observation_end_ix": number[]
  // }[];
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
  const map = new Map(
    Object.entries(textMapping).sort((a, b) => {
      if (+a === +b) return 0;
      if (+a < +b) return -1;
      return 1;
    }),
  );

  let last_index = 0;
  for (const [key, value] of map) {
    const start = value.user_provided_text_start;
    const end = value.user_provided_text_end;
    const stringInBetweenRadgraphRelevantTokens = userProvidedText.substring(last_index, start)
    if (stringInBetweenRadgraphRelevantTokens.length > 0) {
      textArray.push([null, stringInBetweenRadgraphRelevantTokens, last_index]);
    }
    textArray.push([+key, userProvidedText.substring(start, end), start]);
    last_index = end;
  }

  textArray.push([null, userProvidedText.substring(last_index), last_index]);

  // check zod
  const new_processed_annotations = JSON.parse(processed_annotations) as {
    "observation": string,
    "observation_start_ix": number[],
    "located_at": string[],
    "located_at_start_ix": number[][],
    "located_at_end_ix": number[][],
    "tags": string[],
    "suggestive_of": string | null,
    "observation_end_ix": number[]
  }[];
  new_processed_annotations.forEach((o) => {
    const group = [];

    // observations
    const observation_start_indices = o.observation_start_ix;
    const observation_end_indices = o.observation_end_ix;
    for (const i in observation_start_indices) {
      const start = observation_start_indices[i];
      const end = observation_end_indices[i];

      for (let i = start; i <= end; i++) {
        group.push(i);
      }
    }

    // located at
    const located_at_start_indices = o.located_at_start_ix
    const located_at_end_indices = o.located_at_end_ix;
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
      const previousValue = groupMap.get(element)
      groupMap.set(element, group.concat(previousValue ?? []));
    }
  });

  return (
    <>
      <div className="whitespace-pre-wrap tracking-wide leading-5">
        {textArray.map(([k, s, id]) => (
          <span
            key={selectedFileName + " " + id}
            className={
              ((currentHoveredWordIndex ?? -1) > 0 &&
                (groupMap.get(k) ?? []).includes(currentHoveredWordIndex)
                ? "bg-green-300 transition-color cursor-pointer keyword-highlight"
                : "") +
              " " +
              (k && !(groupMap.get(k) ?? []).includes(currentHoveredWordIndex)
                ? "underline"
                : "")
            }
            onMouseEnter={() => { setCurrentHoveredWordIndex(k); console.log(groupMap.get(k)) }}
            onMouseLeave={() => setCurrentHoveredWordIndex(null)}
            onClick={() => {
              if (k === null) return;
              console.log(groupMap.get(k));
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </>
  );
}
