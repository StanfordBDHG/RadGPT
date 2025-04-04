//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Skeleton } from "@stanfordspezi/spezi-web-design-system/components/Skeleton";
import { Spinner } from "@stanfordspezi/spezi-web-design-system/components/Spinner";
import { StateContainer } from "@stanfordspezi/spezi-web-design-system/components/StateContainer";
import { PageTitle } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { createFileRoute } from "@tanstack/react-router";
import { updateDoc } from "firebase/firestore";
import { FileText } from "lucide-react";
import { useGetFileDetailsSubscription } from "@/modules/files/queries";
import { docRefs, getCurrentUser } from "@/modules/firebase/app";
import { DashboardLayout } from "../DashboardLayout";
import { UserFeedbackOrigin } from "./FeedbackDialog/MultiCheckboxFeedbackDialog";
import { UserIssueDialog } from "./FeedbackDialog/UserIssueDialog";
import { UserPositiveFeedbackDialog } from "./FeedbackDialog/UserPositiveFeedbackDialog";
import { Legend } from "./Legend";
import { DislikeButton, LikeButton } from "./QuestionAnswer/FeedbackButtons";
import { ReportText } from "./ReportText";

const FileDetail = () => {
  const { fileName } = Route.useParams();
  const { file, customFileName } = useGetFileDetailsSubscription({ fileName });

  if (!file) {
    return (
      <DashboardLayout
        title={
          <PageTitle
            title="Reports"
            subTitle={customFileName ?? <Skeleton className="h-5 w-8" />}
            icon={<FileText />}
          />
        }
      >
        <StateContainer grow className="min-h-screen">
          <Spinner />
        </StateContainer>
      </DashboardLayout>
    );
  }

  const fileRef = docRefs.fileMetaData({
    userId: getCurrentUser().uid,
    fileName: fileName,
  });
  const onLike = async () => {
    await updateDoc(fileRef, {
      user_feedback: { like: true, dislike: false },
    });
  };
  const onDislike = async () => {
    await updateDoc(fileRef, {
      user_feedback: { like: false, dislike: true },
    });
  };

  const like = file.user_feedback?.like ?? false;
  const dislike = file.user_feedback?.dislike ?? false;

  const hasAnnotations = !!file.processed_annotations?.length;
  return (
    <DashboardLayout
      title={
        <PageTitle
          title="Reports"
          subTitle={customFileName ?? <Skeleton className="h-5 w-8" />}
          icon={<FileText />}
        />
      }
    >
      <div className="relative mx-auto flex max-w-5xl grow flex-col">
        <Legend />
        <h2 className="mb-4 text-xl font-bold text-gray-800">Report</h2>
        <ReportText file={file} />
        {hasAnnotations && (
          <div className="mt-4 flex flex-row items-center gap-2 pb-6">
            <UserPositiveFeedbackDialog
              context={{
                report_id: fileName,
                origin: UserFeedbackOrigin.ReportLevel,
              }}
            >
              <LikeButton
                onClick={onLike}
                like={like}
                data-testid="report-like"
              />
            </UserPositiveFeedbackDialog>
            <UserIssueDialog
              context={{
                report_id: fileName,
                origin: UserFeedbackOrigin.ReportLevel,
              }}
            >
              <DislikeButton
                onClick={onDislike}
                dislike={dislike}
                data-testid="report-dislike"
              />
            </UserIssueDialog>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const Route = createFileRoute("/_dashboard/file/$fileName")({
  component: FileDetail,
});
