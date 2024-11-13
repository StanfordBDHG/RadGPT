//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Auth } from "firebase/auth";
import { StorageReference } from "firebase/storage";
import FileList from "./FileList";

interface SideMenuProps {
  auth: Auth;
  files: { customName: string; ref: StorageReference }[];
  selectedFile: StorageReference | null;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<StorageReference | null>
  >;
  className?: string;
}

export default function SideMenu({
  auth,
  files,
  selectedFile,
  setSelectedFile,
  className,
}: SideMenuProps) {
  return (
    <div className={cn("flex flex-col items-start w-full h-full", className)}>
      <FileList
        files={files}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
      <Button className="mt-auto" onClick={() => auth.signOut()}>
        Sign out
      </Button>
    </div>
  );
}
