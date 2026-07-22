import { redirect } from "next/navigation";

export default function WorkflowRedirectPage() {
  redirect("/dashboard/settings");
}
