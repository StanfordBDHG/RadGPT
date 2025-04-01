//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type TextMapping } from "./processedAnnotations";

type TextMappingEntry = [string, TextMapping[string]];

const compareKeys = ([a]: TextMappingEntry, [b]: TextMappingEntry) => {
  const numberA = Number(a);
  const numberB = Number(b);
  if (isNaN(numberA) || isNaN(numberB)) {
    throw "Element is not a number";
  }
  if (numberA === numberB) return 0;
  if (numberA < numberB) return -1;
  return 1;
};

export enum TextBlockPosition {
  Left = "keyword-highlight-left",
  Center = "keyword-highlight-center",
  Right = "keyword-highlight-right",
  StandAlone = "keyword-highlight",
}

export interface TextBlock {
  token: number | null;
  textString: string;
  startPosition: number;
  textBlockPosition: TextBlockPosition;
}

export const getTextBlocks = (
  textMapping: TextMapping,
  userProvidedText: string,
) => {
  const textArray: TextBlock[] = [];

  // Sorting the Map according to its keys
  const sortedMap = new Map(Object.entries(textMapping).sort(compareKeys));

  let lastIndex = 0;
  let isPreviousTokenRadGraphRelevant = false;
  for (const [key, value] of sortedMap) {
    const { user_provided_text_start: start, user_provided_text_end: end } =
      value;
    if (lastIndex === 0 && start === lastIndex) {
      // If the first word is already an RadGraph token, it should be added to the textArray right away
      textArray.push({
        token: Number(key),
        textString: userProvidedText.substring(start, end),
        startPosition: lastIndex,
        textBlockPosition: TextBlockPosition.StandAlone,
      });
      isPreviousTokenRadGraphRelevant = true;
      lastIndex = end;
      continue;
    }

    const stringInBetweenRadgraphRelevantTokens = userProvidedText.substring(
      lastIndex,
      start,
    );
    if (stringInBetweenRadgraphRelevantTokens.length > 0) {
      textArray.push({
        token: null,
        textString: stringInBetweenRadgraphRelevantTokens,
        startPosition: lastIndex,
        textBlockPosition: TextBlockPosition.StandAlone,
      });
      isPreviousTokenRadGraphRelevant = false;
    } else {
      const lastElement = textArray.pop();
      if (lastElement) {
        const {
          token: prevToken,
          textString: prevText,
          startPosition: prevKey,
        } = lastElement;
        textArray.push({
          token: prevToken,
          textString: prevText,
          startPosition: prevKey,
          textBlockPosition:
            isPreviousTokenRadGraphRelevant ?
              TextBlockPosition.Center
            : TextBlockPosition.Left,
        });
      }
      isPreviousTokenRadGraphRelevant = true;
    }
    textArray.push({
      token: Number(key),
      textString: userProvidedText.substring(start, end),
      startPosition: start,
      textBlockPosition:
        isPreviousTokenRadGraphRelevant ?
          TextBlockPosition.Right
        : TextBlockPosition.StandAlone,
    });
    lastIndex = end;
  }
  textArray.push({
    token: null,
    textString: userProvidedText.substring(lastIndex),
    startPosition: lastIndex,
    textBlockPosition: TextBlockPosition.StandAlone,
  });
  return textArray;
};
