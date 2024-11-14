//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { functions } from "@/src/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { httpsCallable, HttpsCallable } from "firebase/functions";
import { useState } from "react";
import QuestionAnswer from "./QuestionAnswer";

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

type DetailedResponse = {
  main_answer: string

  question1: string | null
  answer1: string | null

  question2: string | null
  answer2: string | null

  question3: string | null
  answer3: string | null
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

  const openState = useOpenState(false)
  const [answer, setAnswer] = useState<null | string>(null);
  const [question1, setQuestion1] = useState<null | string>(null)
  const [answer1, setAnswer1] = useState<null | string>(null)
  const [question2, setQuestion2] = useState<null | string>(null)
  const [answer2, setAnswer2] = useState<null | string>(null)
  const [question3, setQuestion3] = useState<null | string>(null)
  const [answer3, setAnswer3] = useState<null | string>(null)

  const [selectedNumber, setSelectedNumber] = useState<null | number>(null)


  if (textArray.length === 0)
    textArray.push([null, "loading...", 0])

  return (
    <>
      <Dialog open={openState.isOpen} onOpenChange={openState.setIsOpen}>
        <DialogContent className="max-h-screen overflow-y-auto min-w-[50%]">
          <DialogHeader>
            <DialogTitle>Detailed Explanation</DialogTitle>
            <p>{answer}</p>
            {question1 && answer1 && <QuestionAnswer onClick={() => selectedNumber === 1 ? setSelectedNumber(null) : setSelectedNumber(1)} isSelected={selectedNumber === 1} question={question1} answer={answer1} />}
            {question2 && answer2 && <QuestionAnswer onClick={() => selectedNumber === 2 ? setSelectedNumber(null) : setSelectedNumber(2)} isSelected={selectedNumber === 2} question={question2} answer={answer2} />}
            {question3 && answer3 && <QuestionAnswer onClick={() => selectedNumber === 3 ? setSelectedNumber(null) : setSelectedNumber(3)} isSelected={selectedNumber === 3} question={question3} answer={answer3} />}
          </DialogHeader >
        </DialogContent >
      </Dialog >
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
            onClick={async () => {
              if (k === null) return;
              setAnswer("loading...")
              setQuestion1(null)
              setQuestion2(null)
              setQuestion3(null)
              setSelectedNumber(null)
              openState.open()
              const gptAnswer: HttpsCallable<
                { file_name: string, token_ids: number[] },
                DetailedResponse
              > = httpsCallable(functions, "on_detail_request");
              const r = await gptAnswer({ file_name: selectedFileName, token_ids: groupMap.get(+(k ?? "-1")) ?? [] });
              setAnswer(r.data.main_answer)
              setQuestion1(r.data.question1)
              setQuestion2(r.data.question2)
              setQuestion3(r.data.question3)
              setAnswer1(r.data.answer1)
              setAnswer2(r.data.answer2)
              setAnswer3(r.data.answer3)
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </>
  );
}
