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
import { FileText } from "lucide-react";
import { useGetFileDetailsSubscription } from "@/modules/files/queries";
import { DashboardLayout } from "../DashboardLayout";
import { FeedbackForm } from "./FeedbackForm";
import { HelpHeader } from "./HelpDialog";
import { ReportIssueButton } from "./ReportIssueButton";
import { ReportText } from "./ReportText";

const FileDetail = () => {
  const { fileName } = Route.useParams();
  const { file, customFileName } = useGetFileDetailsSubscription({ fileName });

  const hasAnnotations = !!file?.processed_annotations?.length;
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
      {file ?
        <div className="relative mx-auto flex max-w-5xl grow flex-col">
          <HelpHeader />
          <h2 className="mb-4 text-xl font-bold text-gray-800">Report</h2>
          <ReportText file={file} />
          {hasAnnotations && (
            <>
              <ReportIssueButton
                className="mt-6 self-start"
                context={{
                  reportID: fileName,
                }}
              />
              <FeedbackForm file={file} />
            </>
          )}
        </div>
      : <StateContainer grow className="min-h-screen">
          <Spinner />
        </StateContainer>
      }
    </DashboardLayout>
  );
};

export const Route = createFileRoute("/_dashboard/file/$fileName")({
  component: FileDetail,
});
