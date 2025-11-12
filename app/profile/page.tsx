// app/profile/page.tsx
import { redirect } from "next/navigation";

export default function ProfileRedirect() {
  // We don’t need /profile anymore — always land on the Hub
  redirect("/dashboard/hub");
}

