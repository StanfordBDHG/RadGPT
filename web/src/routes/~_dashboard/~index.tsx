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
import ReportText from "./ReportText";

const schema = z.object({
  processed_annotations: z.string().min(1, "Processed annotations are required"),
  user_provided_text: z.string().min(1, "User-provided text is required"),
  text_mapping: z.record(z.string(), z.object({
    "user_provided_text_start": z.number(),
    "user_provided_text_end": z.number()
  }))
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
  const [textMapping, setTextMapping] = useState<{
    [id: number]: {
      "user_provided_text_start": number,
      "user_provided_text_end": number
    }
  } | null>(null);
  const [processed_annotations, setProcessedAnnotations] = useState<string>("");
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
      setReportText(data.user_provided_text);
      setTextMapping(data.text_mapping);
      setProcessedAnnotations(data.processed_annotations);
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
      {reportText && textMapping && processed_annotations ? (
        <ReportText
          userProvidedText={reportText}
          selectedFileName={selectedFile?.name ?? ""}
          textMapping={textMapping}
          processed_annotations={processed_annotations}
        />
      ) : (
        <p>Please add a file</p>
      )}
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
