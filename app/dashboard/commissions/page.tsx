import { redirect } from "next/navigation";

// Commissions list merged into the Queue page (search + filter live there now).
export default function CommissionsPage() {
  redirect("/dashboard/queue");
}
