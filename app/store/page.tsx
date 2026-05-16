import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrdersDashboard } from "@/components/orders/orders-dashboard";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StoreConsolePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login?callbackUrl=/store");
  }

  return <OrdersDashboard />;
}
