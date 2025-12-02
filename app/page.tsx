"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

export default function HomePage() {
  const { token, hydrated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/feed" : "/newss");
  }, [hydrated, token, router]);

  return null;
}
