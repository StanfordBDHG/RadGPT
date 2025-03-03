//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { deleteObject, type StorageReference } from "firebase/storage";
import { Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { type GetFileListResult } from "@/utils/queries";

interface FileListProps {
  files: GetFileListResult;
  selectedFile: StorageReference | undefined;
  setSelectedFile: Dispatch<SetStateAction<StorageReference | undefined>>;
  onFileDelete: () => Promise<void>;
}

export const FileList = ({
  files,
  selectedFile,
  setSelectedFile,
  onFileDelete,
}: FileListProps) => {
  const onDelete = async (fileRef: StorageReference | undefined) => {
    if (fileRef) {
      await deleteObject(fileRef);
    }
    await onFileDelete();
  };
  return (
    <div className="flex w-full flex-col">
      {files.map((item) => (
        <div className="flex flex-row" key={item.ref?.name}>
          <button
            onClick={() => setSelectedFile(item.ref)}
            className={cn(
              "interactive-opacity",
              item.ref?.name === selectedFile?.name && "font-bold",
            )}
          >
            {item.customName}
          </button>
          <button
            className="interactive-opacity ml-auto"
            onClick={() => onDelete(item.ref)}
            aria-label="Delete"
          >
            <Trash2 className="w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};
