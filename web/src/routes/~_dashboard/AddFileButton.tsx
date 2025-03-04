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
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type StorageReference } from "firebase/storage";
import { FilePlus } from "lucide-react";
import { filesQueries } from "@/modules/files/queries";
import { FileCreationForm } from "./FileCreationForm";

export const AddFileButton = () => {
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
      <DialogTrigger asChild>
        <Button className="mx-auto" onClick={openState.open}>
          <FilePlus />
          Add New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medical Report</DialogTitle>
        </DialogHeader>
        <FileCreationForm
          onUploadSuccess={onUploadSuccessDialogClose}
          onExistingFileUpload={onExistingFileUploadDialogClose}
        />
      </DialogContent>
    </Dialog>
  );
};
