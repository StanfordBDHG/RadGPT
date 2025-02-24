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
import {AddFileButton} from "./AddFileButton";

interface SideMenuProps {
  auth: Auth;
  files: GetFileListResult;
  selectedFile: StorageReference | undefined;
  setSelectedFile: Dispatch<SetStateAction<StorageReference | undefined>>;
  className?: string;
  onFileDelete: () => Promise<void>;
  onUploadSuccess?: (ref: StorageReference, medicalReport: string) => void;
}

export function SideMenu({
  auth,
  files,
  selectedFile,
  setSelectedFile,
  className,
  onFileDelete,
  onUploadSuccess,
}: SideMenuProps) {
  return (
    <div className="flex flex-col items-start justify-begin w-full h-full px-2 xl:px-0 lg:mt-0 mt-3">
      <AddFileButton
        onUploadSuccess={onUploadSuccess}
        files={files}
        setSelectedFile={setSelectedFile}
      />
      <div
        className={cn(
          "flex flex-col items-start w-full h-full mt-4",
          className
        )}
      >
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
    </div>
  );
}
