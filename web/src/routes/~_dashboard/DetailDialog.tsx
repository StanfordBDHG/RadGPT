//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { Loader2 } from 'lucide-react'


export default function DetailDialog({ answer, openState }: {
    answer: string | null,
    openState: {
        isOpen: boolean;
        setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
        close: () => void;
        open: () => void;
        toggle: () => void;
    },
}) {
    return (
        <Dialog open={openState.isOpen} onOpenChange={openState.setIsOpen}>
            <DialogContent className="max-h-screen overflow-y-auto min-w-[50%]">
                <DialogHeader>
                    <DialogTitle>Detailed Explanation</DialogTitle>
                    {
                        answer !== null ?
                            <p>{answer}</p> :
                            <Loader2 className="mt-2 animate-spin" />
                    }
                </DialogHeader >
            </DialogContent >
        </Dialog >
    )
}

