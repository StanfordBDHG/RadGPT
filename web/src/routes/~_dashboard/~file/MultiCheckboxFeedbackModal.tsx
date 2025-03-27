//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Checkbox } from "@stanfordspezi/spezi-web-design-system/components/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { SideLabel } from "@stanfordspezi/spezi-web-design-system/components/SideLabel";
import { toast } from "@stanfordspezi/spezi-web-design-system/components/Toaster";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { addDoc, CollectionReference } from "firebase/firestore";
import { z } from "zod";
import { getCurrentUser } from "@/modules/firebase/app";
import { cloneElement, type ReactElement } from "react";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { UserFeedbackContext } from "@/modules/firebase/refs";

interface MultiCheckboxFeedbackModalProps {
  className?: string;
  context: UserFeedbackContext;
  children: ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  checkboxLabels: string[];
  collectionReference: CollectionReference;
  title: string;
  description: string;
  submitButtonText: string;
  toastSuccessText: string;
  toastFailureText: string;
}

export const MultiCheckboxFeedbackModal = ({
  className,
  context,
  children,
  checkboxLabels,
  collectionReference,
  title,
  description,
  submitButtonText,
  toastSuccessText,
  toastFailureText,
}: MultiCheckboxFeedbackModalProps) => {
  const justPredefinedAnswersSchema = z.object({
    answerSelection: z
      .array(z.boolean())
      .length(checkboxLabels.length)
      .refine((userSelection) => userSelection.some((value) => value), {
        message: "At least one option has to be selected",
      }),
    isOtherSelected: z.literal(false),
    userInputedAnswer: z.string(),
  });
  const otherSelectedSchema = z.object({
    answerSelection: z.array(z.boolean()).length(checkboxLabels.length),
    isOtherSelected: z.literal(true),
    userInputedAnswer: z
      .string()
      .min(1, { message: "Please specify the answer in more detail" }),
  });

  const formSchema = z.union([
    justPredefinedAnswersSchema,
    otherSelectedSchema,
  ]);
  const openState = useOpenState(false);

  const form = useForm({
    formSchema,
    defaultValues: {
      answerSelection: checkboxLabels.map(() => false),
      isOtherSelected: false,
      userInputedAnswer: "",
    },
  });

  const handleClose = () => {
    openState.close();
    form.reset();
  };

  const handleSubmit = form.handleSubmit(async (medicalReport) => {
    const selectedAnswersStrings = medicalReport.answerSelection
      .map((isUserSelected, index) =>
        isUserSelected ? checkboxLabels.at(index) : null,
      )
      .filter(Boolean);

    try {
      await addDoc(collectionReference, {
        pre_defined_answers:
          selectedAnswersStrings.length ? selectedAnswersStrings : null,
        user_inputed_answer:
          medicalReport.userInputedAnswer ?
            medicalReport.userInputedAnswer
          : null,
        user_id: getCurrentUser().uid,
        ...context,
      });
      toast.success(toastSuccessText);
    } catch {
      toast.error(toastFailureText);
    }

    handleClose();
  });

  const mergedOnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (children.props.onClick) {
      children.props.onClick(event);
    }
    openState.open();
  };
  const mergedClassName =
    children.props.className ?
      cn(children.props.className, className)
    : className;
  const triggerElement = cloneElement(children, {
    onClick: mergedOnClick,
    className: mergedClassName,
  });

  return (
    <>
      <Dialog open={openState.isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-screen min-w-[25%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {checkboxLabels.map((label, index) => {
              const name = `answerSelection.${index}` as const;
              return (
                <Field
                  control={form.control}
                  key={name}
                  name={name}
                  checkEmptyError
                  render={({ field: { value, onChange, ...field } }) => (
                    <SideLabel>
                      <Checkbox
                        checked={value}
                        onCheckedChange={onChange}
                        {...field}
                      />
                      {label}
                    </SideLabel>
                  )}
                />
              );
            })}
            <Field
              control={form.control}
              name="isOtherSelected"
              checkEmptyError
              render={({ field: { value, onChange, ...field } }) => (
                <SideLabel>
                  <Checkbox
                    checked={value}
                    onCheckedChange={onChange}
                    {...field}
                  />
                  Other:
                </SideLabel>
              )}
            />
            <Field
              control={form.control}
              name="userInputedAnswer"
              className="mt-2"
              error={form.formState.errors.answerSelection?.root}
              render={({ field }) => (
                <Input
                  placeholder="Please specify"
                  {...field}
                  onChange={(event) => {
                    const value = event.target.value;
                    form.setValue("isOtherSelected", value !== "");
                    field.onChange(event);
                  }}
                />
              )}
            />
            <DialogFooter>
              <Button type="submit" isPending={form.formState.isSubmitting}>
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {triggerElement}
    </>
  );
};
