//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { toast } from "@stanfordspezi/spezi-web-design-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type StorageReference } from "firebase/storage";
import { type ReactNode } from "react";
import { filesQueries } from "@/modules/files/queries";
import { FileCreationForm } from "./FileCreationForm";

interface AddFileDialogProps {
  children: ReactNode;
}

export const AddFileDialog = ({ children }: AddFileDialogProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const openState = useOpenState(false);

  const onUploadSuccessDialogClose = (ref: StorageReference) => {
    void queryClient.invalidateQueries(filesQueries.listFiles());
    void navigate({ to: `/file/${ref.name}` });
    openState.close();
  };

  const onExistingFileUploadDialogClose = (ref: StorageReference) => {
    toast.info(
      "This medical report has already been uploaded. It has now been selected.",
    );
    void navigate({ to: `/file/${ref.name}` });
    openState.close();
  };

  return (
    <Dialog open={openState.isOpen} onOpenChange={openState.setIsOpen}>
      <DialogTrigger asChild onClick={openState.open}>
        {children}
      </DialogTrigger>
      <DialogContent size="3xl" className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medical Report</DialogTitle>
          <DialogDescription>
            Please insert your radiology report below.
          </DialogDescription>
        </DialogHeader>
        <FileCreationForm
          onUploadSuccess={onUploadSuccessDialogClose}
          onExistingFileUpload={onExistingFileUploadDialogClose}
        />
      </DialogContent>
    </Dialog>
  );
};
