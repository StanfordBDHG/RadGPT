//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type User } from "firebase/auth";
import { type FullMetadata, getMetadata, listAll, ref } from "firebase/storage";
import { storage } from "./firebase";

const metaDataCompare = (metaData1: FullMetadata, metaData2: FullMetadata) => {
  const dateFile1 = new Date(metaData1.timeCreated);
  const dateFile2 = new Date(metaData2.timeCreated);

  if (dateFile1 > dateFile2) return 1;
  if (dateFile1 < dateFile2) return -1;
  return 0;
};

export const getFileList = async (currentUser: User) => {
  const storageReportsReference = ref(
    storage,
    `users/${currentUser.uid}/reports`
  );
  const listResult = await listAll(storageReportsReference);
  const fileMetadata = await Promise.all(
    listResult.items.map((i) => getMetadata(i))
  );
  const fileList = fileMetadata.sort(metaDataCompare).map((fullMetaData) => ({
    ref: fullMetaData.ref,
    customName: fullMetaData.customMetadata?.medicalReportName ?? "undefined",
  }));
  return fileList;
};

export type GetFileListResult = Awaited<ReturnType<typeof getFileList>>;
