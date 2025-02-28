//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { createFileRoute, redirect } from "@tanstack/react-router";
import { doc, onSnapshot } from "firebase/firestore";
import { type StorageReference } from "firebase/storage";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useAuthenticatedUser } from "@/modules/user";
import { auth, firestore } from "@/utils/firebase";
import {
  getProcessedAnnotationsFromJSONString,
  type ProcessedAnnotations,
} from "@/utils/processedAnnotations";
import { type GetFileListResult, getFileList } from "@/utils/queries";
import { type TextMapping } from "@/utils/textMapping";
import { DashboardLayout } from "./DashboardLayout";
import { FeedbackForm } from "./FeedbackForm";
import { ReportText } from "./ReportText";
import { SideMenu } from "./SideMenu";

const Dashboard = () => {
  const currentUser = useAuthenticatedUser();

  const [files, setFiles] = useState<GetFileListResult>([]);

  const fetchFiles = useCallback(async () => {
    const fileList = currentUser ? await getFileList(currentUser) : [];
    setFiles(fileList);
  }, [currentUser]);

  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  const [reportText, setReportText] = useState<string>("");
  const [textMapping, setTextMapping] = useState<TextMapping | null>(null);
  const [processedAnnotations, setProcessedAnnotations] = useState<
    ProcessedAnnotations[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<
    StorageReference | undefined
  >(undefined);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) return;

    let ignore = false;
    const annotationReference = doc(
      firestore,
      `users/${currentUser?.uid}/${selectedFile.name}/report_meta_data`,
    );
    const unsubscribe = onSnapshot(annotationReference, (documentSnapshot) => {
      if (ignore) {
        return;
      }
      const data = getProcessedAnnotationsFromJSONString(
        documentSnapshot.data(),
      );
      if (!data) {
        setTextMapping(null);
        setProcessedAnnotations([]);
        setUserFeedback(null);
        return;
      }
      setReportText(data.user_provided_text);
      setTextMapping(data.text_mapping ?? null);
      setProcessedAnnotations(data.processed_annotations ?? []);
      setUserFeedback(data.user_feedback ?? null);
    });
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [selectedFile, currentUser]);

  const onUploadSuccess = (ref: StorageReference, medicalReport: string) => {
    void fetchFiles();
    setSelectedFile(ref);
    setReportText(medicalReport);
    setTextMapping(null);
    setProcessedAnnotations([]);
    setUserFeedback(null);
  };

  const onFileDelete = async () => {
    setReportText("");
    setSelectedFile(undefined);
    await fetchFiles();
  };

  return (
    <>
      <Helmet>
        <title>RadGPT</title>
      </Helmet>
      <DashboardLayout
        mobile={
          <SideMenu
            auth={auth}
            files={files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onFileDelete={onFileDelete}
            onUploadSuccess={onUploadSuccess}
          />
        }
        aside={
          <SideMenu
            className="mt-4"
            auth={auth}
            files={files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onFileDelete={onFileDelete}
            onUploadSuccess={onUploadSuccess}
          />
        }
      >
        {reportText ?
          <div className="flex flex-col justify-between">
            <ReportText
              userProvidedText={reportText}
              selectedFileName={selectedFile?.name ?? ""}
              textMapping={textMapping}
              processedAnnotations={processedAnnotations}
            />
            {processedAnnotations.length > 0 && (
              <FeedbackForm
                className="mt-4"
                selectedFileName={selectedFile?.name ?? ""}
                feedback={userFeedback}
              />
            )}
          </div>
        : <p>Please add or select a file</p>}
      </DashboardLayout>
    </>
  );
};

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
