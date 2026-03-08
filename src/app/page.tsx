import { redirect } from "next/navigation";

// Kořenová stránka přesměruje na výchozí locale
export default function RootPage() {
  redirect("/cs/dashboard");
}
