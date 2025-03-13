//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  Async,
  queriesToAsyncProps,
} from "@stanfordspezi/spezi-web-design-system/components/Async";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { deleteObject } from "firebase/storage";
import { Trash2 } from "lucide-react";
import { filesQueries } from "@/modules/files/queries";

export const FileList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFilesQuery = useQuery(filesQueries.listFiles());
  const { data: files } = listFilesQuery;
  const fileRouteParams = useParams({
    from: "/_dashboard/file/$fileName",
    shouldThrow: false,
  });

  const onDelete = async (file: (typeof files)[number]) => {
    if (!file.ref) return;
    await deleteObject(file.ref);
    const isSelectedFile = fileRouteParams?.fileName === file.ref.name;
    if (isSelectedFile) {
      await navigate({ to: "/" });
    }
    void queryClient.invalidateQueries(filesQueries.listFiles());
  };

  return (
    <div className="flex w-full flex-col">
      <Async {...queriesToAsyncProps([listFilesQuery])}>
        {files.map((file) => {
          const name = file.ref?.name;
          if (!name) return;
          const isActive = name === fileRouteParams?.fileName;
          return (
            <div
              className={cn(
                "focus-ring group relative flex cursor-pointer items-center rounded-lg font-medium no-underline transition xl:w-full xl:self-start",
                isActive ?
                  "bg-accent/50 text-primary"
                : "text-foreground/60 hover:bg-accent hover:text-foreground",
              )}
              key={name}
            >
              <Link
                to="/file/$fileName"
                params={{ fileName: name }}
                className={cn(
                  "interactive-opacity w-full p-2 text-left",
                  isActive ? "font-bold" : "group-hover:opacity-80",
                )}
              >
                {file.customName}
              </Link>
              <button
                className="interactive-opacity ml-auto h-full px-2 text-foreground transition hover:text-destructive"
                onClick={() => onDelete(file)}
                aria-label="Delete"
              >
                <Trash2 className="w-5" />
              </button>
            </div>
          );
        })}
      </Async>
    </div>
  );
};
