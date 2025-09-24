"use client";

import { AuthProvider } from "@/contexts/auth-context";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);
