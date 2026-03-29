import { setRequestLocale } from "next-intl/server";
import AccountClient from "@/components/account/AccountClient";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountClient />;
}
