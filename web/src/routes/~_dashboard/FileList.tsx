//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { StorageReference } from "firebase/storage";

export default function FileList({
  files,
  selectedFile,
  setSelectedFile,
}: {
  files: { customName: string; ref: StorageReference }[];
  selectedFile: StorageReference | null;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<StorageReference | null>
  >;
}) {
  return (
    <div className="flex flex-col">
      {files.map((item) => (
        <a
          key={item.ref.name}
          onClick={() => setSelectedFile(item.ref)}
          className={cn(
            item.ref.name === selectedFile?.name ? "font-bold" : "",
            "cursor-pointer",
          )}
        >
          {item.customName}
        </a>
      ))}
    </div>
  );
}
