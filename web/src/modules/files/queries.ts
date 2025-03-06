//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { queryOptions, skipToken, useQueryClient } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { doc, getDoc, onSnapshot, type DocumentData } from "firebase/firestore";
import { type FullMetadata, getMetadata, listAll, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { type z } from "zod";
import {
  callables,
  firestore,
  getCurrentUser,
  storage,
} from "@/modules/firebase/app";
import type { OnDetailedExplanationRequestInput } from "@/modules/firebase/utils";
import { processedAnnotationsSchema } from "./processedAnnotations";

const metaDataCompare = (metaData1: FullMetadata, metaData2: FullMetadata) => {
  const dateFile1 = new Date(metaData1.timeCreated);
  const dateFile2 = new Date(metaData2.timeCreated);

  if (dateFile1 > dateFile2) return 1;
  if (dateFile1 < dateFile2) return -1;
  return 0;
};

const listFiles = async () => {
  const currentUser = getCurrentUser();
  const storageReportsReference = ref(
    storage,
    `users/${currentUser.uid}/reports`,
  );
  const listResult = await listAll(storageReportsReference);
  const fileMetadata = await Promise.all(
    listResult.items.map((i) => getMetadata(i)),
  );
  const fileList = fileMetadata.sort(metaDataCompare).map((fullMetaData) => ({
    ref: fullMetaData.ref,
    customName: fullMetaData.customMetadata?.medicalReportName ?? "undefined",
  }));
  return fileList;
};

interface GetFileDetailsPayload {
  name: string;
}

const parseFileDetails = (data: DocumentData, name: string) => ({
  ...processedAnnotationsSchema.parse(data),
  name,
});

const getFileDetails = async (payload: GetFileDetailsPayload) => {
  const fileRef = doc(
    firestore,
    `users/${getCurrentUser().uid}/${payload.name}/report_meta_data`,
  );
  const fileSnapshot = await getDoc(fileRef);
  const data = fileSnapshot.data();
  if (!data) throw notFound();
  return parseFileDetails(data, payload.name);
};

export type FileDetails = z.infer<typeof processedAnnotationsSchema> & {
  name: string;
};

export const filesQueries = {
  listFiles: () =>
    queryOptions({
      queryKey: ["listFiles"],
      queryFn: listFiles,
      initialData: [],
    }),
  getFileDetails: (payload: GetFileDetailsPayload) =>
    queryOptions({
      queryKey: ["getFile", payload],
      queryFn: () => getFileDetails(payload),
    }),
  getDetailedExplanation: (payload: OnDetailedExplanationRequestInput | null) =>
    queryOptions({
      queryKey: ["onDetailedExplanationRequest", payload],
      queryFn:
        payload ?
          () => callables.onDetailedExplanationRequest(payload)
        : skipToken,
    }),
};

export const useGetFileDetailsSubscription = (payload: { name: string }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<FileDetails>();

  useEffect(() => {
    let ignore = false;
    const fileRef = doc(
      firestore,
      `users/${getCurrentUser().uid}/${payload.name}/report_meta_data`,
    );
    const unsubscribe = onSnapshot(fileRef, (snapshot) => {
      const data = snapshot.data();
      if (ignore || !data) return;
      const file = parseFileDetails(data, payload.name);
      queryClient.setQueryData(
        filesQueries.getFileDetails({ name: payload.name }).queryKey,
        file,
      );
      setFile(file);
    });
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [payload.name]);

  return file;
};
