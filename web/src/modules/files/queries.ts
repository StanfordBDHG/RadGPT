//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { toast } from "@stanfordspezi/spezi-web-design-system/components/Toaster";
import {
  queryOptions,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type DocumentData, onSnapshot } from "firebase/firestore";
import {
  deleteObject,
  type FullMetadata,
  getMetadata,
  listAll,
  ref,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { type z } from "zod";
import {
  callables,
  docRefs,
  getCurrentUser,
  storage,
} from "@/modules/firebase/app";
import { type OnDetailedExplanationRequestInput } from "@/modules/firebase/getCallables";
import { collections, type FeedbackPayload } from "@/modules/firebase/refs";
import { getDocData } from "@/modules/firebase/utils";
import { processedAnnotationsSchema } from "./processedAnnotations";

const metaDataCompare = (metaData1: FullMetadata, metaData2: FullMetadata) => {
  const dateFile1 = new Date(metaData1.timeCreated);
  const dateFile2 = new Date(metaData2.timeCreated);

  if (dateFile1 > dateFile2) return 1;
  if (dateFile1 < dateFile2) return -1;
  return 0;
};

const listFiles = async () => {
  const storageReportsReference = ref(
    storage,
    collections.reports({ userId: getCurrentUser().uid }),
  );
  const listResult = await listAll(storageReportsReference);
  const fileMetadata = await Promise.all(
    listResult.items.map((i) => getMetadata(i)),
  );
  const fileList = fileMetadata.sort(metaDataCompare).map((fullMetaData) => ({
    ref: fullMetaData.ref,
    customName: fullMetaData.customMetadata?.medicalReportName ?? "undefined",
    hash: fullMetaData.customMetadata?.hash ?? "undefined",
  }));
  return fileList;
};

export type FileListItem = Awaited<ReturnType<typeof listFiles>>[number];

const parseFileDetails = (data: DocumentData, name: string) => ({
  ...processedAnnotationsSchema.parse(data),
  name,
});

export type FileDetails = z.infer<typeof processedAnnotationsSchema> & {
  name: string;
};

export const filesQueries = {
  listFiles: () =>
    queryOptions({
      queryKey: ["listFiles"],
      queryFn: listFiles,
    }),
  getDetailedExplanation: (payload: OnDetailedExplanationRequestInput | null) =>
    queryOptions({
      queryKey: ["onDetailedExplanationRequest", payload],
      queryFn:
        payload ?
          () => callables.onDetailedExplanationRequest(payload)
        : skipToken,
    }),
  getObservationFeedback: (payload: FeedbackPayload | null) =>
    queryOptions({
      queryKey: ["getObservationFeedback", payload],
      queryFn:
        payload ? () => getDocData(docRefs.feedback(payload)) : skipToken,
    }),
};

export const useDeleteFileMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRouteParams = useParams({
    from: "/_dashboard/file/$fileName",
    shouldThrow: false,
  });

  return useMutation({
    mutationFn: async (file: FileListItem) => {
      if (!file.ref) return;
      await deleteObject(file.ref);
    },
    onSuccess: async (_data, file) => {
      const isSelectedFile = fileRouteParams?.fileName === file.ref?.name;
      if (isSelectedFile) {
        await navigate({ to: "/" });
      }
      void queryClient.invalidateQueries(filesQueries.listFiles());
    },
    onError: () => toast.error("Deleting file failed. Please try again later"),
  });
};

export const useGetFileDetailsSubscription = ({
  fileName,
}: {
  fileName: string;
}) => {
  const [file, setFile] = useState<FileDetails>();
  const { data: customFileName } = useQuery({
    ...filesQueries.listFiles(),
    select: (files) =>
      files.find((listFile) => listFile.ref?.name === file?.name)?.customName,
  });

  useEffect(() => {
    let ignore = false;
    const fileRef = docRefs.fileMetaData({
      userId: getCurrentUser().uid,
      fileName,
    });
    const unsubscribe = onSnapshot(fileRef, (snapshot) => {
      const data = snapshot.data();
      if (ignore || !data) return;
      const file = parseFileDetails(data, fileName);
      setFile(file);
    });
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [fileName]);

  return { file, customFileName };
};
