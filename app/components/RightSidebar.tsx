"use client";
import React from "react";
import TrendingTopics from "@/app/components/TrendingTopics";
import TopMembers from "@/app/components/TopMembers";

export default function RightSidebar() {
  return (
    <aside id="right-sidebar" className="hidden lg:block sticky top-4 self-start">
      <div className="grid gap-3">
        <TrendingTopics />
        <TopMembers />
      </div>
    </aside>
  );
}
