//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Tooltip } from "@stanfordspezi/spezi-web-design-system/components/Tooltip";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { ComponentProps } from "react";

type LikeButtonProps = Pick<ComponentProps<"button">, "onClick"> & {
  like: boolean | null;
};

export const LikeButton = ({ like, ...props }: LikeButtonProps) => (
  <Tooltip tooltip="Like answer" delayDuration={500}>
    <button
      aria-label={like ? "Liked answer" : "Like answer"}
      className="focus-ring"
      {...props}
    >
      <ThumbsUp
        className={cn(
          "h-6 transition",
          like ? "text-green-700" : "text-gray-300 hover:text-green-700",
        )}
      />
    </button>
  </Tooltip>
);

type DislikeButtonProps = Pick<ComponentProps<"button">, "onClick"> & {
  dislike: boolean | null;
};

export const DislikeButton = ({ dislike, ...props }: DislikeButtonProps) => (
  <Tooltip tooltip="Dislike answer" delayDuration={500}>
    <button
      aria-label={dislike ? "Disliked answer" : "Dislike answer"}
      className="focus-ring"
      {...props}
    >
      <ThumbsDown
        className={cn(
          "h-6 transition",
          dislike ? "text-red-700" : "text-gray-300 hover:text-red-700",
        )}
      />
    </button>
  </Tooltip>
);
