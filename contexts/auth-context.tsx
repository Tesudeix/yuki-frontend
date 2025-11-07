"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiRequest, isSuccess } from "../lib/api-client";
import {
  ADMIN_PROFILE_STORAGE_KEY,
  ADMIN_TOKEN_STORAGE_KEY,
  PASSWORD_MIN_LENGTH,
  PHONE_REGEX,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../lib/constants";
import { resolveErrorMessage } from "../lib/error-utils";
import { normalizePhoneForE164 } from "../lib/phone";
import { AdminProfile, AuthenticatedUser } from "../lib/types";

type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

type AuthContextValue = {
  token: string | null;
  user: AuthenticatedUser | null;
  adminToken: string | null;
  adminProfile: AdminProfile | null;
  hydrated: boolean;
  register: (payload: { phone: string; password: string; name?: string; inviteCode?: string }) => Promise<ActionResult<AuthenticatedUser>>;
  login: (payload: { phone: string; password: string }) => Promise<ActionResult<AuthenticatedUser>>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<ActionResult>;
  adminLogin: (payload: { phone: string; password: string }) => Promise<ActionResult<AdminProfile>>;
  fetchProfile: () => Promise<ActionResult<AuthenticatedUser>>;
  logout: () => void;
  clearAdmin: () => void;
  updateUserLocal: (patch: Partial<AuthenticatedUser>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseUser = (raw: string | null): AuthenticatedUser | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as AuthenticatedUser) : null;
  } catch {
    return null;
  }
};

const parseAdminProfile = (raw: string | null): AdminProfile | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as AdminProfile) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const persistToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const persistUser = useCallback((value: AuthenticatedUser | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (value) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const persistAdminToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (value) {
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  }, []);

  const persistAdminProfile = useCallback((value: AdminProfile | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (value) {
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(ADMIN_PROFILE_STORAGE_KEY);
    }
  }, []);

  const fetchProfile = useCallback(async (): Promise<ActionResult<AuthenticatedUser>> => {
    if (!token) {
      return { ok: false, error: "Token байхгүй байна." };
    }

    const response = await apiRequest<{ user: AuthenticatedUser }>("/users/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (isSuccess(response)) {
      setUser(response.user);
      persistUser(response.user);
      return { ok: true, data: response.user };
    }

    const message = resolveErrorMessage(response, "Профайл татахад алдаа гарлаа.");
    if (message.toLowerCase().includes("unauthorized")) {
      setToken(null);
      persistToken(null);
      setUser(null);
      persistUser(null);
    }

    return { ok: false, error: message };
  }, [persistToken, persistUser, token]);

  const register = useCallback(
    async ({ phone, password, name, inviteCode }: { phone: string; password: string; name?: string; inviteCode?: string }): Promise<ActionResult<AuthenticatedUser>> => {
      const normalizedPhone = normalizePhoneForE164(phone);
      if (!normalizedPhone || !PHONE_REGEX.test(normalizedPhone)) {
        return { ok: false, error: "Утасны дугаарыг зөв оруулна уу." };
      }

      if (password.trim().length < PASSWORD_MIN_LENGTH) {
        return {
          ok: false,
          error: `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.`,
        };
      }

      const response = await apiRequest<{ token: string; user: AuthenticatedUser }>("/users/register", {
        method: "POST",
        body: JSON.stringify({ phone: normalizedPhone, password, name, inviteCode }),
      });

      if (isSuccess(response)) {
        setToken(response.token);
        persistToken(response.token);
        setUser(response.user);
        persistUser(response.user);
        return { ok: true, data: response.user };
      }

      return { ok: false, error: resolveErrorMessage(response, "Бүртгэл үүсгэхэд алдаа гарлаа.") };
    },
    [persistToken, persistUser],
  );

  const login = useCallback(
    async ({ phone, password }: { phone: string; password: string }): Promise<ActionResult<AuthenticatedUser>> => {
      const normalizedPhone = normalizePhoneForE164(phone);
      if (!normalizedPhone || !PHONE_REGEX.test(normalizedPhone)) {
        return { ok: false, error: "Утасны дугаарыг дахин шалгаарай." };
      }

      if (password.trim().length < PASSWORD_MIN_LENGTH) {
        return {
          ok: false,
          error: `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.`,
        };
      }

      const response = await apiRequest<{ token: string; user: AuthenticatedUser }>("/users/login", {
        method: "POST",
        body: JSON.stringify({ phone: normalizedPhone, password }),
      });

      if (isSuccess(response)) {
        setToken(response.token);
        persistToken(response.token);
        setUser(response.user);
        persistUser(response.user);
        return { ok: true, data: response.user };
      }

      return { ok: false, error: resolveErrorMessage(response, "Нэвтрэхэд алдаа гарлаа.") };
    },
    [persistToken, persistUser],
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }): Promise<ActionResult> => {
      if (!token) {
        return { ok: false, error: "Token байхгүй байна." };
      }

      if (newPassword.trim().length < PASSWORD_MIN_LENGTH) {
        return {
          ok: false,
          error: `Шинэ нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.`,
        };
      }

      const response = await apiRequest<Record<string, never>>("/users/password/change", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (isSuccess(response)) {
        return { ok: true };
      }

      return { ok: false, error: resolveErrorMessage(response, "Нууц үг шинэчлэхэд алдаа гарлаа.") };
    },
    [token],
  );

  const adminLogin = useCallback(
    async ({ phone, password }: { phone: string; password: string }): Promise<ActionResult<AdminProfile>> => {
      const normalizedPhone = normalizePhoneForE164(phone);
      if (!normalizedPhone) {
        return { ok: false, error: "Утасны дугаараа шалгана уу." };
      }

      const response = await apiRequest<{ token: string; admin: AdminProfile }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ phone: normalizedPhone, password }),
      });

      if (isSuccess(response)) {
        setAdminToken(response.token);
        persistAdminToken(response.token);
        setAdminProfile(response.admin);
        persistAdminProfile(response.admin);
        return { ok: true, data: response.admin };
      }

      return { ok: false, error: resolveErrorMessage(response, "Админ эрхээр нэвтрэхэд алдаа гарлаа.") };
    },
    [persistAdminProfile, persistAdminToken],
  );

  const logout = useCallback(() => {
    setToken(null);
    persistToken(null);
    setUser(null);
    persistUser(null);
    setAdminToken(null);
    persistAdminToken(null);
    setAdminProfile(null);
    persistAdminProfile(null);
  }, [persistAdminProfile, persistAdminToken, persistToken, persistUser]);

  const clearAdmin = useCallback(() => {
    setAdminToken(null);
    persistAdminToken(null);
    setAdminProfile(null);
    persistAdminProfile(null);
  }, [persistAdminProfile, persistAdminToken]);

  const updateUserLocal = useCallback((patch: Partial<AuthenticatedUser>) => {
    setUser((prev) => {
      const merged = { ...(prev || ({} as AuthenticatedUser)), ...patch } as AuthenticatedUser;
      persistUser(merged);
      return merged;
    });
  }, [persistUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = parseUser(localStorage.getItem(USER_STORAGE_KEY));
    const storedAdminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    const storedAdminProfile = parseAdminProfile(localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY));

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }

    if (storedAdminToken) {
      setAdminToken(storedAdminToken);
    }

    if (storedAdminProfile) {
      setAdminProfile(storedAdminProfile);
    }

    setHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      adminToken,
      adminProfile,
      hydrated,
      register,
      login,
      changePassword,
      adminLogin,
      fetchProfile,
      logout,
      clearAdmin,
      updateUserLocal,
    }),
    [
      adminLogin,
      adminProfile,
      adminToken,
      hydrated,
      changePassword,
      clearAdmin,
      fetchProfile,
      login,
      logout,
      register,
      token,
      user,
      updateUserLocal,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
