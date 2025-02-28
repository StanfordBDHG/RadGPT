//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { toast } from "@stanfordspezi/spezi-web-design-system";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { type StorageReference } from "firebase/storage";
import { FilePlus } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { type GetFileListResult } from "@/utils/queries";
import { FileCreationForm } from "./FileCreationForm";

interface AddFileModalProps {
  onUploadSuccess?: (ref: StorageReference, medicalReport: string) => void;
  files: GetFileListResult;
  setSelectedFile: Dispatch<SetStateAction<StorageReference | undefined>>;
}

export const AddFileButton = ({
  onUploadSuccess,
  files,
  setSelectedFile,
}: AddFileModalProps) => {
  const openState = useOpenState(false);

  const onUploadSuccessDialogClose = (
    ref: StorageReference,
    medicalReport: string,
  ) => {
    if (onUploadSuccess) onUploadSuccess(ref, medicalReport);
    openState.close();
  };

  const onExistingFileUploadDialogClose = (ref: StorageReference) => {
    setSelectedFile(ref);
    toast.info(
      "This medical report has already been uploaded. It has now been selected.",
    );
    openState.close();
  };

  return (
    <Dialog open={openState.isOpen} onOpenChange={openState.setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={openState.open}>
          <FilePlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medical Report</DialogTitle>
        </DialogHeader>
        <FileCreationForm
          onUploadSuccess={onUploadSuccessDialogClose}
          files={files}
          onExistingFileUpload={onExistingFileUploadDialogClose}
        ></FileCreationForm>
      </DialogContent>
    </Dialog>
  );
};
