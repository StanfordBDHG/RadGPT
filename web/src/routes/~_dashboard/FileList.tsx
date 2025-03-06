//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { deleteObject } from "firebase/storage";
import { Trash2 } from "lucide-react";
import { filesQueries } from "@/modules/files/queries";

export const FileList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: files } = useQuery(filesQueries.listFiles());
  const fileRouteParams = useParams({
    from: "/_dashboard/file/$name",
    shouldThrow: false,
  });

  const onDelete = async (file: (typeof files)[number]) => {
    if (!file.ref) return;
    await deleteObject(file.ref);
    const isSelectedFile = fileRouteParams?.name === file.ref.name;
    if (isSelectedFile) {
      await navigate({ to: "/" });
    }
    void queryClient.invalidateQueries(filesQueries.listFiles());
  };

  return (
    <div className="flex w-full flex-col">
      {files.map((file) => {
        const name = file.ref?.name;
        if (!name) return;
        return (
          <div className="flex flex-row" key={name}>
            <Link
              to="/file/$name"
              params={{ name }}
              className={cn(
                "interactive-opacity",
                name === fileRouteParams?.name && "font-bold",
              )}
            >
              {file.customName}
            </Link>
            <button
              className="interactive-opacity ml-auto"
              onClick={() => onDelete(file)}
              aria-label="Delete"
            >
              <Trash2 className="w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
