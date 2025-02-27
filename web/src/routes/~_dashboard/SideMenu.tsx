//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { type Auth } from "firebase/auth";
import { type StorageReference } from "firebase/storage";
import { type Dispatch, type SetStateAction } from "react";
import { type GetFileListResult } from "@/utils/queries";
import { FileList } from "./FileList";

interface SideMenuProps {
  auth: Auth;
  files: GetFileListResult;
  selectedFile: StorageReference | undefined;
  setSelectedFile: Dispatch<SetStateAction<StorageReference | undefined>>;
  className?: string;
  onFileDelete: () => Promise<void>;
}

export function SideMenu({
  auth,
  files,
  selectedFile,
  setSelectedFile,
  className,
  onFileDelete,
}: SideMenuProps) {
  return (
    <div className={cn("flex h-full w-full flex-col items-start", className)}>
      <FileList
        files={files}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onFileDelete={onFileDelete}
      />
      <Button className="mt-auto" onClick={() => auth.signOut()}>
        Sign out
      </Button>
    </div>
  );
}
