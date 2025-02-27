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
  const numberA = Number(a);
  const numberB = Number(b);
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
  LEFT = "keyword-highlight-left",
  CENTER = "keyword-highlight-center",
  RIGHT = "keyword-highlight-right",
  STAND_ALONE = "keyword-highlight",
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
  const sortedMap = new Map(Object.entries(textMapping).sort(numberCompare));

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
        textBlockPosition: TextBlockPosition.STAND_ALONE,
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
        textBlockPosition: TextBlockPosition.STAND_ALONE,
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
          textBlockPosition: isPreviousTokenRadGraphRelevant
            ? TextBlockPosition.CENTER
            : TextBlockPosition.LEFT,
        });
      }
      isPreviousTokenRadGraphRelevant = true;
    }
    textArray.push({
      token: Number(key),
      textString: userProvidedText.substring(start, end),
      startPosition: start,
      textBlockPosition: isPreviousTokenRadGraphRelevant
        ? TextBlockPosition.RIGHT
        : TextBlockPosition.STAND_ALONE,
    });
    lastIndex = end;
  }
  textArray.push({
    token: null,
    textString: userProvidedText.substring(lastIndex),
    startPosition: lastIndex,
    textBlockPosition: TextBlockPosition.STAND_ALONE,
  });
  return textArray;
};
