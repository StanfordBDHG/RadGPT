//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { auth } from "@/modules/firebase/app";
import { AddFileButton } from "./AddFileButton";
import { FileList } from "./FileList";

export const SideMenu = () => (
  <div className="mt-3 flex size-full flex-col px-2 lg:mt-0 xl:px-0">
    <AddFileButton />
    <div className="mt-4 flex size-full flex-col items-start">
      <FileList />
      <Button className="mt-auto" onClick={() => auth.signOut()}>
        Sign out
      </Button>
    </div>
  </div>
);
