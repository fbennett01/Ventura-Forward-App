import type { ReactNode } from "react";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { BottomTabs } from "@/components/nav/bottom-tabs";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen pb-20">
      <main className="flex-1 w-full mx-auto max-w-md sm:max-w-lg lg:max-w-2xl">
        {children}
      </main>
      <InstallPrompt />
      <BottomTabs />
    </div>
  );
}