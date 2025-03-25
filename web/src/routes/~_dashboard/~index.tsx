//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { DataTable } from "@stanfordspezi/spezi-web-design-system";
import { queriesToAsyncProps } from "@stanfordspezi/spezi-web-design-system/components/Async";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { RowDropdownMenu } from "@stanfordspezi/spezi-web-design-system/components/DataTable";
import { DropdownMenuItem } from "@stanfordspezi/spezi-web-design-system/components/DropdownMenu";
import { PageTitle } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/table-core";
import { FileText, Trash } from "lucide-react";
import {
  type FileListItem,
  filesQueries,
  useDeleteFileMutation,
} from "@/modules/files/queries";
import { useNavigateOrOpen } from "@/utils/useNavigateOrOpen";
import { AddFileDialog } from "./AddFileDialog";
import { DashboardLayout } from "./DashboardLayout";

const columnHelper = createColumnHelper<FileListItem>();

const Dashboard = () => {
  const deleteFileMutation = useDeleteFileMutation();
  const navigateOrOpen = useNavigateOrOpen();
  const listFilesQuery = useQuery(filesQueries.listFiles());
  const files = listFilesQuery.data ?? [];

  return (
    <DashboardLayout title={<PageTitle title="Reports" icon={<FileText />} />}>
      <DataTable
        columns={[
          columnHelper.accessor((file) => file.customName, {
            id: "name",
            header: "Name",
          }),
          columnHelper.display({
            id: "actions",
            cell: (props) => {
              const file = props.row.original;
              return (
                <RowDropdownMenu>
                  <DropdownMenuItem
                    onClick={() => deleteFileMutation.mutate(file)}
                  >
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </RowDropdownMenu>
              );
            },
          }),
        ]}
        data={files}
        entityName="reports"
        tableView={{
          onRowClick: (file, event) =>
            void navigateOrOpen(event, { to: `/file/${file.ref?.name}` }),
        }}
        empty={{
          actions: (
            <AddFileDialog>
              <Button size="xs">Add New Report</Button>
            </AddFileDialog>
          ),
        }}
        {...queriesToAsyncProps([listFilesQuery])}
      />
    </DashboardLayout>
  );
};

export const Route = createFileRoute("/_dashboard/")({
  component: Dashboard,
});
