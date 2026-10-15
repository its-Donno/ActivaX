"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateActionForm } from "./create-action-form";

export function CreateActionDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl gap-4 p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Create an action</DialogTitle>
          <DialogDescription>
            Turn an idea into real action. Choose the type, add details, and get
            people involved.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-6 pb-6">
          {open && (
            <CreateActionForm
              onSuccess={(id) => {
                setOpen(false);
                router.push(`/actions/${id}`);
                router.refresh();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CreateActionButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <CreateActionDialog>
      <Button className={className} size="lg">
        {children ?? (
          <>
            <Plus className="size-4" /> Create
          </>
        )}
      </Button>
    </CreateActionDialog>
  );
}
