//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

export interface ProcessedAnnotations {
  observation: string;
  observation_start_ix: number[];
  located_at: string[];
  located_at_start_ix: number[][];
  located_at_end_ix: number[][];
  tags: string[];
  suggestive_of: string[] | null;
  observation_end_ix: number[];
}

export enum AnnotationProcessingError {
  validationFailed = 1,
  uploadLimitReached = 2,
  timeout = 3,
}

// Source: https://github.com/JacobWeisenburger/zod_utilz/blob/4093595e5a6d95770872598ba3bc405d4e9c963b/src/stringToJSON.ts#LL4-L12C8
const jsonStringToProcessedAnnotations = z
  .string()
  .optional()
  .transform((str, ctx) => {
    try {
      if (!str) return [];
      return JSON.parse(str) as ProcessedAnnotations[];
    } catch (e) {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      throw e;
    }
  });

const textMappingSchema = z.record(
  z.string(),
  z.object({
    user_provided_text_start: z.number(),
    user_provided_text_end: z.number(),
  }),
);

export type TextMapping = z.infer<typeof textMappingSchema>;

export const processedAnnotationsSchema = z.object({
  processed_annotations: jsonStringToProcessedAnnotations.pipe(
    z
      .object({
        observation: z.string().min(1, "Observation"),
        observation_start_ix: z.number().array().nonempty("nonempty obs start"),
        located_at: z.string().array(),
        located_at_start_ix: z.number().array().array(),
        located_at_end_ix: z.number().array().array(),
        tags: z.string().array().nonempty("non empty tags"),
        suggestive_of: z.string().array().nullable(),
        observation_end_ix: z
          .number()
          .array()
          .nonempty("non empty obs end idx"),
      })
      .array()
      .optional(),
  ),
  user_provided_text: z.string().min(1, "User-provided text is required"),
  text_mapping: textMappingSchema.optional(),
  user_feedback: z
    .object({
      like: z.boolean(),
      dislike: z.boolean(),
    })
    .optional(),
  error_code: z.nativeEnum(AnnotationProcessingError).optional(),
});

export const getGroupMap = (processedAnnotations: ProcessedAnnotations[]) => {
  const groupMapping = new Map<
    number,
    {
      observationIndex: number;
      observationGroup: number[];
      isLocatedAt: boolean;
    }
  >();
  processedAnnotations.forEach((observation, index) => {
    const observationGroup: number[] = [];
    const locatedAtElements: number[] = [];

    // observations
    observation.observation_start_ix.forEach(
      (startIndex, observationStartIndex) => {
        const endIndex = observation.observation_end_ix[observationStartIndex];

        for (let index = startIndex; index <= endIndex; index++) {
          observationGroup.push(index);
        }
      },
    );

    // located at
    observation.located_at_start_ix.forEach(
      (startIndexGroup, locatedAtStartGroupIndex) => {
        const endIndexGroup =
          observation.located_at_end_ix[locatedAtStartGroupIndex];

        startIndexGroup.forEach((startIndex, locatedAtStartIndex) => {
          const endIndex = endIndexGroup[locatedAtStartIndex];

          for (let index = startIndex; index <= endIndex; index++) {
            locatedAtElements.push(index);
            observationGroup.push(index);
          }
        });
      },
    );

    // Attach to element group
    for (const element of observationGroup) {
      const previousValue = groupMapping.get(element);
      groupMapping.set(element, {
        observationIndex: previousValue?.observationIndex ?? index,
        observationGroup: (previousValue?.observationGroup ?? []).concat(
          observationGroup,
        ),
        isLocatedAt:
          previousValue?.isLocatedAt ?? locatedAtElements.includes(element),
      });
    }
  });

  return groupMapping;
};
