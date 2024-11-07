//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { auth, firestore, storage } from "@/src/utils/firebase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "./DashboardLayout";
import SideMenu from "./SideMenu";
import { doc, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { getMetadata, listAll, ref, StorageReference } from "firebase/storage";
import { useAuthenticatedUser } from "@/src/hooks/useAuthenticatedUser";
import { z } from "zod";
import AddFileButton from "./AddFileButton";

const schema = z.object({
  processed_annotations: z
    .string()
    .min(1, "Content of medical report is required"),
  radgraph_text: z.string().min(1, "Content of medical report is required"),
});

function Dashboard() {
  const currentUser = useAuthenticatedUser();

  const [files, setFiles] = useState<
    { customName: string; ref: StorageReference }[]
  >([]);

  const fetchFiles = useCallback(async () => {
    const storageReportsReference = ref(
      storage,
      `users/${currentUser?.uid}/reports`,
    );
    const listResult = await listAll(storageReportsReference);
    const fileMetadata = await Promise.all(
      listResult.items.map((i) => getMetadata(i)),
    );
    const fileList = fileMetadata
      .sort((metaData1, metaData2) => {
        const dateFile1 = new Date(metaData1.updated);
        const dateFile2 = new Date(metaData2.updated);

        if (dateFile1 === dateFile2) return 0;
        if (dateFile1 < dateFile2) return 1;
        return -1;
      })
      .map((fullMetaData) => {
        return {
          ref: fullMetaData.ref as StorageReference,
          customName:
            fullMetaData.customMetadata?.["medicalReportName"] ?? "undefined",
        };
      });
    setFiles(fileList);
  }, [currentUser]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const [reportText, setReportText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<StorageReference | null>(
    null,
  );

  useEffect(() => {
    if (!selectedFile) return;
    setReportText("shimmering...");

    // TODO tanstack query
    const annotationReference = doc(
      firestore,
      `users/${currentUser?.uid}/annotations/${selectedFile.name}`,
    );
    onSnapshot(annotationReference, (d) => {
      const data = schema.parse(d.data());
      setReportText(data["radgraph_text"]);
    });
  }, [selectedFile, currentUser]);

  const onUploadSuccess = (ref: StorageReference) => {
    fetchFiles();
    setSelectedFile(ref);
  };

  return (
    <DashboardLayout
      title={<AddFileButton onUploadSuccess={onUploadSuccess} />}
      mobile={
        <SideMenu
          className="px-2 pt-4"
          auth={auth}
          files={files}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      }
      aside={
        <div className="flex flex-col items-start justify-begin w-full h-full px-2 xl:px-0">
          <AddFileButton onUploadSuccess={onUploadSuccess} />
          <SideMenu
            className="mt-4"
            auth={auth}
            files={files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </div>
      }
    >
      {/* <FileCreationForm afterUpload={fetchFiles} /> */}
      {reportText ? (
        <div className="flex flex-row flex-wrap">{reportText}</div>
      ) : <p>Please add a file</p>
      }
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_dashboard/")({
  component: Dashboard,
  beforeLoad: async ({ location }) => {
    await auth.authStateReady();
    if (!auth.currentUser) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
