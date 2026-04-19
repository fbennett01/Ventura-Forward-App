import type { ReactNode } from "react";
import { BottomTabs } from "@/components/nav/bottom-tabs";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto w-full max-w-3xl p-4">{children}</main>
      <BottomTabs />
    </div>
  );
}