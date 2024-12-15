//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { DocumentData } from "firebase/firestore";
import { z } from "zod";

export type ProcessedAnnotations = {
  observation: string;
  observation_start_ix: number[];
  located_at: string[];
  located_at_start_ix: number[][];
  located_at_end_ix: number[][];
  tags: string[];
  suggestive_of: string[] | null;
  observation_end_ix: number[];
};

// Source: https://github.com/JacobWeisenburger/zod_utilz/blob/4093595e5a6d95770872598ba3bc405d4e9c963b/src/stringToJSON.ts#LL4-L12C8
const jsonStringToProcessedAnnotations = z
  .string()
  .transform((str, ctx): ProcessedAnnotations[] => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      throw e;
    }
  });

const schema = z.object({
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
      .min(1, "has to have at least one element"),
  ),
  user_provided_text: z.string().min(1, "User-provided text is required"),
  text_mapping: z.record(
    z.string(),
    z.object({
      user_provided_text_start: z.number(),
      user_provided_text_end: z.number(),
    }),
  ),
});

export const getGroupMap = (processedAnnotations: ProcessedAnnotations[]) => {
  const groupMapping = new Map<number, number[]>();
  processedAnnotations.forEach((observation) => {
    const observationGroup = [];

    // observations
    const observation_start_indices = observation.observation_start_ix;
    const observation_end_indices = observation.observation_end_ix;
    for (const observation_start_index in observation_start_indices) {
      const start_index = observation_start_indices[observation_start_index];
      const end_index = observation_end_indices[observation_start_index];

      for (let index = start_index; index <= end_index; index++) {
        observationGroup.push(index);
      }
    }

    // located at
    const located_at_start_indices = observation.located_at_start_ix;
    const located_at_end_indices = observation.located_at_end_ix;
    for (const located_at_start_group_index in located_at_start_indices) {
      const start_index_group =
        located_at_start_indices[located_at_start_group_index];
      const end_index_group =
        located_at_end_indices[located_at_start_group_index];
      for (const located_at_start_index in start_index_group) {
        const start_index = start_index_group[located_at_start_index];
        const end_index = end_index_group[located_at_start_index];
        for (let index = start_index; index <= end_index; index++) {
          observationGroup.push(index);
        }
      }
    }

    // Attach to element group
    for (const element of observationGroup) {
      const previousValue = groupMapping.get(element) ?? [];
      groupMapping.set(element, observationGroup.concat(previousValue));
    }
  });

  return groupMapping;
};

export const getProcessedAnnotationsFromJSONString = (
  documentData: DocumentData | undefined,
) => {
  if (documentData) return schema.parse(documentData);
};
