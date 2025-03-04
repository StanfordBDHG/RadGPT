//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Spinner } from "@stanfordspezi/spezi-web-design-system/components/Spinner";
import { StateContainer } from "@stanfordspezi/spezi-web-design-system/components/StateContainer";
import { createFileRoute } from "@tanstack/react-router";
import { useGetFileDetailsSubscription } from "@/modules/files/queries";
import { ReportText } from "@/routes/~_dashboard/~file/ReportText";
import { DashboardLayout } from "../DashboardLayout";
import { FeedbackForm } from "./FeedbackForm";

const FileDetail = () => {
  const { name } = Route.useParams();
  const file = useGetFileDetailsSubscription({ name });

  return (
    <DashboardLayout>
      {file ?
        <div className="flex flex-col justify-between">
          <ReportText file={file} />
          {!!file.processed_annotations?.length && (
            <FeedbackForm className="mt-4" file={file} />
          )}
        </div>
      : <StateContainer grow className="min-h-screen">
          <Spinner />
        </StateContainer>
      }
    </DashboardLayout>
  );
};

export const Route = createFileRoute("/_dashboard/file/$name")({
  component: FileDetail,
});
