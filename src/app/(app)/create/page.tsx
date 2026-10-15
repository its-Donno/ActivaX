import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { CreateActionForm } from "@/components/create/create-action-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Create an action" };

export default async function CreatePage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/home">
          <ArrowLeft className="size-4" /> Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create an action</CardTitle>
          <CardDescription>
            Turn an idea into real action. Choose the type, add details, and get
            people involved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateActionForm />
        </CardContent>
      </Card>
    </div>
  );
}
