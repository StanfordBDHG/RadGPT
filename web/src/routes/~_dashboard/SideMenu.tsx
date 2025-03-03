//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { type Auth } from "firebase/auth";
import { type StorageReference } from "firebase/storage";
import { type Dispatch, type SetStateAction } from "react";
import { type GetFileListResult } from "@/utils/queries";
import { AddFileButton } from "./AddFileButton";
import { FileList } from "./FileList";

interface SideMenuProps {
  auth: Auth;
  files: GetFileListResult;
  selectedFile: StorageReference | undefined;
  setSelectedFile: Dispatch<SetStateAction<StorageReference | undefined>>;
  onFileDelete: () => Promise<void>;
  onUploadSuccess?: (ref: StorageReference, medicalReport: string) => void;
}

export const SideMenu = ({
  auth,
  files,
  selectedFile,
  setSelectedFile,
  onFileDelete,
  onUploadSuccess,
}: SideMenuProps) => (
  <div className="justify-begin mt-3 flex h-full w-full flex-col items-start px-2 lg:mt-0 xl:px-0">
    <AddFileButton
      onUploadSuccess={onUploadSuccess}
      files={files}
      setSelectedFile={setSelectedFile}
    />
    <div className="mt-4 flex size-full flex-col items-start">
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
