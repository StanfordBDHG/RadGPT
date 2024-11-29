//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { auth, firestore } from "@/src/utils/firebase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "./DashboardLayout";
import SideMenu from "./SideMenu";
import { doc, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { StorageReference } from "firebase/storage";
import { useAuthenticatedUser } from "@/src/hooks/useAuthenticatedUser";
import AddFileButton from "./AddFileButton";
import ReportText from "./ReportText";
import {
  getProcessedAnnotationsFromJSONString,
  ProcessedAnnotations,
} from "@/src/utils/processedAnnotations";
import { TextMapping } from "@/src/utils/textMapping";
import { getFileList } from "@/src/utils/queries";
import { Helmet } from "react-helmet";

function Dashboard() {
  const currentUser = useAuthenticatedUser();

  const [files, setFiles] = useState<
    { customName: string; ref: StorageReference }[]
  >([]);

  const fetchFiles = useCallback(async () => {
    const fileList = await getFileList(currentUser);
    setFiles(fileList);
  }, [currentUser]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const [reportText, setReportText] = useState<string>("");
  const [textMapping, setTextMapping] = useState<TextMapping | null>(null);
  const [processedAnnotations, setProcessedAnnotations] = useState<
    ProcessedAnnotations[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<StorageReference | null>(
    null,
  );

  useEffect(() => {
    if (!selectedFile) return;

    const annotationReference = doc(
      firestore,
      `users/${currentUser?.uid}/annotations/${selectedFile.name}`,
    );
    const unsubscribe = onSnapshot(annotationReference, (documentSnapshot) => {
      const data = getProcessedAnnotationsFromJSONString(
        documentSnapshot.data(),
      );
      if (!data) {
        setTextMapping(null);
        setProcessedAnnotations([]);
        return;
      }
      setReportText(data.user_provided_text);
      setTextMapping(data.text_mapping ?? null);
      setProcessedAnnotations(data.processed_annotations ?? []);
    });
    return unsubscribe;
  }, [selectedFile, currentUser]);

  const onUploadSuccess = (ref: StorageReference, medicalReport: string) => {
    fetchFiles();
    setSelectedFile(ref);
    setReportText(medicalReport);
    setTextMapping(null);
    setProcessedAnnotations([]);
  };

  return (
    <>
      <Helmet>
        <title>RadGPT</title>
      </Helmet>
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
        {reportText ? (
          <ReportText
            userProvidedText={reportText}
            selectedFileName={selectedFile?.name ?? ""}
            textMapping={textMapping}
            processedAnnotations={processedAnnotations}
          />
        ) : (
          <p>Please add or select a file</p>
        )}
      </DashboardLayout>
    </>
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
