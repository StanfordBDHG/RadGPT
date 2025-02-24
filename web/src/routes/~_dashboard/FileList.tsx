//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { Trash2 } from "lucide-react";
import { deleteObject, StorageReference } from "firebase/storage";

export default function FileList({
  files,
  selectedFile,
  setSelectedFile,
  onFileDelete,
}: {
  files: { customName: string; ref: StorageReference }[];
  selectedFile: StorageReference | null;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<StorageReference | null>
  >;
  onFileDelete: () => Promise<void>;
}) {
  const onDelete = async (fileRef: StorageReference) => {
    await deleteObject(fileRef);
    await onFileDelete();
  };
  return (
    <div className="flex flex-col w-full">
      {files.map((item) => (
        <div className="flex flex-row" key={item.ref.name}>
          <a
            onClick={() => setSelectedFile(item.ref)}
            className={cn(
              item.ref.name === selectedFile?.name ? "font-bold" : "",
              "cursor-pointer"
            )}
          >
            {item.customName}
          </a>
          <a
            className="ml-auto cursor-pointer"
            onClick={() => onDelete(item.ref)}
          >
            <Trash2 className="w-5" />
          </a>
        </div>
      ))}
    </div>
  );
}
