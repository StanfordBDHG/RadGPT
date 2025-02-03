//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

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
import { FileCreationForm } from "./FileCreationForm";

interface AddFileModalProps {
  onUploadSuccess?: (ref: StorageReference, medicalReport: string) => void;
}

export function AddFileButton({ onUploadSuccess }: AddFileModalProps) {
  const openState = useOpenState(false);

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
          onUploadSuccess={(ref, medicalReport) => {
            if (onUploadSuccess) onUploadSuccess(ref, medicalReport);
            openState.close();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
