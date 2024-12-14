//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function QuestionAnswer({
  isSelected,
  question,
  answer,
  onClick,
}: {
  isSelected: boolean;
  question: string;
  answer: string;
  onClick: React.MouseEventHandler<HTMLParagraphElement> | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const heightString = !isSelected ? 0 : (ref.current?.scrollHeight ?? 0);
    setHeight(heightString);
  }, [isSelected]);

  return (
    <>
      <div onClick={onClick} className={"cursor-pointer flex flex-row"}>
        {question}
        {isSelected ? (
          <ChevronUp className="min-w-[2rem] ml-auto" />
        ) : (
          <ChevronDown className="min-w-[2rem] ml-auto" />
        )}
      </div>
      <div
        ref={ref}
        style={{ height: height }}
        className={cn(
          "border-b border-slate-200 overflow-hidden transition-height duration-200",
        )}
      >
        <div className="text-md text-gray-700">{answer}</div>
      </div>
    </>
  );
}
