//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { type StorageReference } from "firebase/storage";
import { type Dispatch, type SetStateAction } from "react";
import { type GetFileListResult } from "@/utils/queries";

interface FileListProps {
  files: GetFileListResult;
  selectedFile: StorageReference | undefined;
  setSelectedFile: Dispatch<SetStateAction<StorageReference | undefined>>;
}

export function FileList({
  files,
  selectedFile,
  setSelectedFile,
}: FileListProps) {
  return (
    <div className="flex flex-col">
      {files.map((item) => (
        <a
          key={item.ref?.name}
          onClick={() => setSelectedFile(item.ref)}
          className={cn(
            item.ref?.name === selectedFile?.name ? "font-bold" : "",
            "cursor-pointer",
          )}
        >
          {item.customName}
        </a>
      ))}
    </div>
  );
}
