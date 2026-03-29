"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  loginWithPassword,
  refreshAccessToken,
  getUserInfo,
  revokeToken,
  type AuthenticationSessionDto,
  type GetUserInfoResponse,
} from "@/lib/service-identity";
import { LS_ACCESS_TOKEN, LS_EXPIRES_AT, LS_REFRESH_TOKEN } from "@/lib/auth-keys";

// ─── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: GetUserInfoResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithSession: (session: AuthenticationSessionDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<GetUserInfoResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = user !== null && accessToken !== null;

  // ── helpers ──────────────────────────────────────────────────────────────────

  function storeTokens(session: AuthenticationSessionDto) {
    const expiresAt = Date.now() + session.expiresIn * 1000;
    localStorage.setItem(LS_ACCESS_TOKEN, session.accessToken);
    localStorage.setItem(LS_REFRESH_TOKEN, session.refreshToken);
    localStorage.setItem(LS_EXPIRES_AT, String(expiresAt));
  }

  function clearTokens() {
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
    localStorage.removeItem(LS_EXPIRES_AT);
  }

  function scheduleRefresh(expiresInSeconds: number) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const delay = Math.max(0, (expiresInSeconds - 60) * 1000);
    refreshTimerRef.current = setTimeout(doRefresh, delay);
  }

  // ── logout ────────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const storedRefresh = localStorage.getItem(LS_REFRESH_TOKEN);
    if (storedRefresh) {
      try { await revokeToken(storedRefresh); } catch { /* best-effort */ }
    }
    clearTokens();
    setUser(null);
    setAccessToken(null);
    const locale = window.location.pathname.split("/")[1] || "en";
    router.push(`/${locale}/login`);
  }, [router]);

  // ── token refresh ─────────────────────────────────────────────────────────────

  const doRefresh = useCallback(async () => {
    const storedRefresh = localStorage.getItem(LS_REFRESH_TOKEN);
    if (!storedRefresh) { await logout(); return; }
    try {
      const session = await refreshAccessToken(storedRefresh);
      storeTokens(session);
      setAccessToken(session.accessToken);
      scheduleRefresh(session.expiresIn);
    } catch {
      await logout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  // ── loginWithSession ──────────────────────────────────────────────────────────

  const loginWithSession = useCallback(async (session: AuthenticationSessionDto) => {
    storeTokens(session);
    const userInfo = await getUserInfo(session.accessToken);
    setUser(userInfo);
    setAccessToken(session.accessToken);
    scheduleRefresh(session.expiresIn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────────

  const login = useCallback(async (username: string, password: string) => {
    const session = await loginWithPassword(username, password);
    await loginWithSession(session);
  }, [loginWithSession]);

  // ── mount hydration ───────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const storedAccess  = localStorage.getItem(LS_ACCESS_TOKEN);
        const storedRefresh = localStorage.getItem(LS_REFRESH_TOKEN);
        const expiresAt     = Number(localStorage.getItem(LS_EXPIRES_AT) ?? "0");

        if (!storedAccess || !storedRefresh) return;

        const remainingMs = expiresAt - Date.now();

        if (remainingMs > 0) {
          try {
            const userInfo = await getUserInfo(storedAccess);
            setUser(userInfo);
            setAccessToken(storedAccess);
            scheduleRefresh(remainingMs / 1000);
          } catch {
            await doRefresh();
          }
        } else {
          await doRefresh();
        }
      } finally {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, accessToken, login, loginWithSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
