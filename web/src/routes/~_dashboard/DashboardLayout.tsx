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
              RADGPT IS EXPERIMENTAL AND PROVIDED “AS IS” AND STANFORD
              UNIVERSITY AND ITS COLLABORATORS, EXCEPT TO THE EXTENT PROHIBTED
              BY LAW, DO NOT MAKE A WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND/OR NON-INFRINGEMENT.
            </p>
            <p>
              BY USING RADGPT, YOU AGREE THAT USE OF RADGPT AND ANY OUTPUTS
              RECEIVED FROM RADGPT ARE AT YOUR SOLE RISK. THE OUTPUTS PROVIDED
              BY RADGPT MAY NOT BE ACCURATE OR COMPLETE. RADGPT DOES NOT, AND
              SHOULD NOT BE USED TO, PROVIDE HEALTH CARE ADVICE. RADGPT OUTPUTS
              ARE PROVIDED FOR INFORMATIONAL PURPOSES AND IS NOT A SUBSTITUTE
              FOR PROFESSIONAL ADVICE. RADGPT DOES NOT PROVIDE MEDICAL TREATMENT
              AND OUTPUTS DO NOT CONSTITUED MEDICAL TREATMENT OR DIAGNOSIS. YOU
              SHOULD CONSULT WITH YOUR PHYSICIAN BEFORE MAKING ANY CHANGES TO
              YOUR HEALTH CARE.
            </p>
            <p>
              STANFORD MAY STORE AND USE DATA YOU INPUT INTO, OR RECEIVE FROM,
              RADGPT TO IMPROVE THE PERFORMANCE OF RADGPT, FOR RESEARCH
              PURPOSES, OR FOR ANY OTHER PURPOSE PERMITTED BY LAW.
            </p>
            <p>
              LIMITATION OF LIABILITY. STANFORD, ITS COLLABORATORS, AUTHORS, AND
              COPYRIGHT HOLDERS WILL HAVE NO LIABILITY FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES,
              INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, OR DATA OR
              OTHER LOSSES ARISING FROM YOUR USE OF RADGPT, EVEN IF THE
              UNIVERSITY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              THE UNIVERSITY’S AGGREGATE LIABILITY UNDER THESE TERMS WILL NOT
              EXCEED ONE HUNDRED DOLLARS ($100). THE LIMITATIONS IN THIS SECTION
              APPLY ONLY TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.
              STANFORD COLLABORATORS, AUTHORS, AND COPYRIGHT HOLDERS ARE
              INTENDED THIRD PARTY BENEFICIARIES OF THIS SECTION.
            </p>
            <p>
              INDEMNITY. TO THE EXTENT PERMITTED BY LAW, YOU AGREE TO INDEMNIFY
              AND HOLD STANFORD UNIVERSITY AND ITS COLLABORATORS HARMLESS FROM
              ANY CLAIMS, LOSSES OR DAMAGES, INCLUDING LEGAL FEES, ARISING OUT
              OF, OR RESULTING FROM, YOUR USE OF RADGPT OR YOUR VIOLATION OR
              ROLE IN VIOLATION OF THESE TERMS. YOU AGREE TO FULLY COOPERATE IN
              STANFORD’S DEFENSE AGAINST ANY SUCH CLAIMS. THESE TERMS SHALL BE
              GOVERNED BY AND INTERPRETED IN ACCORDANCE WITH THE LAWS OF
              CALIFORNIA AND ALL CLAIMS ARISING OUT OF OR RELATING TO THESE
              TERMS SHALL BE BROUGHT EXCLUSIVELY IN THE FEDERAL OR STATE COURTS
              OF SANTA CLARA COUNTY, CALIFORNIA.
            </p>
            <p>
              WE MAY DISCONTINUE RADGPT OR YOUR USE THEREOF AT ANY TIME WITHOUT
              NOTICE, AND WE MAY MAKE CHANGES TO THESE TERMS FROM TIME TO TIME.
            </p>
            <p>YOU MAY USE RADGPT FOR LEGAL PURPOSES ONLY.</p>
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
