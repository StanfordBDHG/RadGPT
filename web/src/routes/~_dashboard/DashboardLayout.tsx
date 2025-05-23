//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { Spinner } from "@stanfordspezi/spezi-web-design-system/components/Spinner";
import { StateContainer } from "@stanfordspezi/spezi-web-design-system/components/StateContainer";
import {
  ConsentDialog,
  ConsentDialogCheckbox,
  ConsentDialogContent,
  ConsentDialogSubmit,
} from "@stanfordspezi/spezi-web-design-system/molecules/ConsentDialog";
import { DashboardLayout as DashboardLayoutBase } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { serverTimestamp, setDoc } from "firebase/firestore";
import { FilePlus } from "lucide-react";
import { type ComponentProps } from "react";
import { Helmet } from "react-helmet";
import { useHasUserConsent } from "@/modules/files/queries";
import { docRefs, getCurrentUser } from "@/modules/firebase/app";
import { AddFileDialog } from "./AddFileDialog";
import { FileList } from "./FileList";
import { User } from "./User";

interface DashboardLayoutProps
  extends ComponentProps<typeof DashboardLayoutBase> {
  showSideMenu?: boolean;
}

export const DashboardLayout = ({
  showSideMenu = true,
  ...props
}: DashboardLayoutProps) => {
  const hasConsent = useHasUserConsent();

  if (hasConsent === null) {
    return (
      <StateContainer grow className="min-h-screen">
        <Spinner />
      </StateContainer>
    );
  }

  const onConsentSubmit = async () => {
    await setDoc(docRefs.userConsent({ userId: getCurrentUser().uid }), {
      create_time: serverTimestamp(),
    });
  };

  const sideMenu =
    showSideMenu ?
      <>
        <AddFileDialog>
          <Button className="mx-auto mt-4 lg:mt-2">
            <FilePlus />
            Add New Report
          </Button>
        </AddFileDialog>
        <div className="mt-8 flex grow flex-col gap-1 lg:w-full">
          <FileList />
        </div>
        <User />
      </>
    : null;

  return (
    <>
      <Helmet>
        <title>RadGPT</title>
      </Helmet>
      <DashboardLayoutBase
        shrinkable={false}
        aside={sideMenu}
        mobile={sideMenu}
        {...props}
      />
      <ConsentDialog open={!hasConsent}>
        <DialogHeader>
          <DialogTitle>Legal Disclaimer</DialogTitle>
          <DialogDescription>
            Please read and accept the terms before proceeding
          </DialogDescription>
        </DialogHeader>
        <ConsentDialogContent>
          <div className="space-y-2">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sed
              tortor nisl. Vestibulum a lectus quis libero condimentum maximus
              ac sed sem. Cras vel ligula ac lorem commodo luctus. Phasellus at
              convallis odio. Duis rhoncus felis vitae nisl pulvinar, quis
              sagittis velit condimentum. Nullam lectus nulla, faucibus vitae
              gravida a, venenatis non est. Nullam gravida, quam rhoncus dapibus
              gravida, erat felis hendrerit arcu, posuere mattis sapien lectus
              sit amet lectus. Nam faucibus velit ut ornare venenatis. Nunc
              sagittis eleifend gravida. Cras in dignissim leo. Suspendisse
              mauris orci, mattis quis eros finibus, cursus rhoncus velit.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sed
              tortor nisl. Vestibulum a lectus quis libero condimentum maximus
              ac sed sem. Cras vel ligula ac lorem commodo luctus. Phasellus at
              convallis odio. Duis rhoncus felis vitae nisl pulvinar, quis
              sagittis velit condimentum. Nullam lectus nulla, faucibus vitae
              gravida a, venenatis non est. Nullam gravida, quam rhoncus dapibus
              gravida, erat felis hendrerit arcu, posuere mattis sapien lectus
              sit amet lectus. Nam faucibus velit ut ornare venenatis. Nunc
              sagittis eleifend gravida. Cras in dignissim leo. Suspendisse
              mauris orci, mattis quis eros finibus, cursus rhoncus velit.
            </p>
          </div>
        </ConsentDialogContent>
        <ConsentDialogCheckbox label="I have read and agree to the privacy policy" />
        <ConsentDialogSubmit onClick={onConsentSubmit}>
          Accept
        </ConsentDialogSubmit>
      </ConsentDialog>
    </>
  );
};
