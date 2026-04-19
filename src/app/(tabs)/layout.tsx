import type { ReactNode } from "react";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { BottomTabs } from "@/components/nav/bottom-tabs";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-vf-navy/70 texture-grain pb-20">
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
        {children}
      </main>
      <InstallPrompt />
      <BottomTabs />
    </div>
  );
}