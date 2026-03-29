"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/AuthProvider";
import { changePassword } from "@/lib/service-identity";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function AccountClient() {
  const t = useTranslations("ACCOUNT");
  const { user, accessToken, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError(t("PASSWORD_MISMATCH"));
      return;
    }

    if (!accessToken) return;
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword, accessToken);
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : t("PASSWORD_MISMATCH"));
    } finally {
      setIsSaving(false);
    }
  }

  const userDto = user?.user;
  const roles = user?.roles ?? [];

  const firstName = userDto?.firstName ?? "";
  const lastName  = userDto?.lastName  ?? "";
  const initials  = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase()
    || userDto?.userName?.slice(0, 2).toUpperCase()
    || "?";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-white text-lg font-semibold shrink-0"
            style={{ background: "#666CFF" }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {`${firstName} ${lastName}`.trim() || userDto?.userName}
            </p>
            <p className="text-sm text-muted-foreground">{userDto?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow label={t("USERNAME")}  value={userDto?.userName} />
          <InfoRow label={t("EMAIL")}     value={userDto?.email} />
          <InfoRow label={t("FIRST_NAME")} value={userDto?.firstName} />
          <InfoRow label={t("LAST_NAME")}  value={userDto?.lastName} />
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("ROLES")}
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-6 border-t border-border pt-5">
          <button
            type="button"
            onClick={logout}
            className="h-9 rounded-lg border border-destructive px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            {t("LOGOUT")}
          </button>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">{t("CHANGE_PASSWORD")}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("CURRENT_PASSWORD")}</label>
            <input
              type="password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("NEW_PASSWORD")}</label>
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("CONFIRM_PASSWORD")}</label>
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {pwError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
              {t("PASSWORD_SUCCESS")}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="h-10 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? t("SAVING") : t("SAVE_PASSWORD")}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
