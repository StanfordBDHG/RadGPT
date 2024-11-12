//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

const numberCompare = (
  [a]: [
    string,
    {
      user_provided_text_start: number;
      user_provided_text_end: number;
    },
  ],
  [b]: [
    string,
    {
      user_provided_text_start: number;
      user_provided_text_end: number;
    },
  ],
) => {
  const numberA = +a;
  const numberB = +b;
  if (isNaN(numberA) || isNaN(numberB)) {
    throw "Element is not a number";
  }
  if (numberA === numberB) return 0;
  if (numberA < numberB) return -1;
  return 1;
};

export interface TextMapping {
  [id: string]: {
    user_provided_text_start: number;
    user_provided_text_end: number;
  };
}

export enum TextBlockPosition {
  LEFT = "-left",
  CENTER = "-center",
  RIGHT = "-right",
  STAND_ALONE = "",
}

export const getTextBlocks = (
  textMapping: TextMapping,
  userProvidedText: string,
) => {
  const textArray: [number | null, string, number, TextBlockPosition][] = [];

  const map = new Map(Object.entries(textMapping).sort(numberCompare));

  let lastIndex = 0;
  let isPreviousTokenRadGraphRelevant = false;
  for (const [key, value] of map) {
    const start = value.user_provided_text_start;
    const end = value.user_provided_text_end;
    const stringInBetweenRadgraphRelevantTokens = userProvidedText.substring(
      lastIndex,
      start,
    );
    if (stringInBetweenRadgraphRelevantTokens.length > 0) {
      textArray.push([
        null,
        stringInBetweenRadgraphRelevantTokens,
        lastIndex,
        TextBlockPosition.STAND_ALONE,
      ]);
      isPreviousTokenRadGraphRelevant = false;
    } else {
      const lastElement = textArray.pop();
      if (lastElement) {
        const [prevToken, prevText, prevKey] = lastElement;
        textArray.push([
          prevToken,
          prevText,
          prevKey,
          isPreviousTokenRadGraphRelevant
            ? TextBlockPosition.CENTER
            : TextBlockPosition.LEFT,
        ]);
      }
      isPreviousTokenRadGraphRelevant = true;
    }
    textArray.push([
      +key,
      userProvidedText.substring(start, end),
      start,
      isPreviousTokenRadGraphRelevant
        ? TextBlockPosition.RIGHT
        : TextBlockPosition.STAND_ALONE,
    ]);
    lastIndex = end;
  }
  textArray.push([
    null,
    userProvidedText.substring(lastIndex),
    lastIndex,
    TextBlockPosition.STAND_ALONE,
  ]);
  return textArray;
};
