import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrdersDashboard } from "@/components/orders/orders-dashboard";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StoreConsolePage() {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (e) {
    console.error("[store] getSession failed", e);
    redirect("/login?callbackUrl=/store");
  }
  if (!session) {
    redirect("/login?callbackUrl=/store");
  }

  return <OrdersDashboard />;
}
