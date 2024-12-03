//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  FullMetadata,
  getMetadata,
  listAll,
  ref,
  StorageReference,
} from "firebase/storage";
import { storage } from "./firebase";
import { User } from "firebase/auth";

const metaDataCompare = (metaData1: FullMetadata, metaData2: FullMetadata) => {
  const dateFile1 = new Date(metaData1.updated);
  const dateFile2 = new Date(metaData2.updated);

  if (dateFile1 < dateFile2) return 1;
  if (dateFile1 > dateFile1) return -1;
  return 0;
};

export async function getFileList(currentUser: User | null) {
  if (currentUser === null) {
    return null;
  }

  const storageReportsReference = ref(
    storage,
    `users/${currentUser.uid}/reports`,
  );
  const listResult = await listAll(storageReportsReference);
  const fileMetadata = await Promise.all(
    listResult.items.map((i) => getMetadata(i)),
  );
  const fileList = fileMetadata.sort(metaDataCompare).map((fullMetaData) => {
    return {
      ref: fullMetaData.ref as StorageReference,
      customName:
        fullMetaData.customMetadata?.["medicalReportName"] ?? "undefined",
    };
  });
  return fileList;
}
