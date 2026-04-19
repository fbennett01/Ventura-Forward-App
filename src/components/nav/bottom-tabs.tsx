"use client";

// TODO: design polish
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Home, Leaf, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Radar", href: "/radar", icon: Radio },
  { label: "Report", href: "/report", icon: Camera },
  { label: "Rewards", href: "/rewards", icon: Leaf },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
};

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t bg-background">
      <ul className="grid grid-cols-4">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = isActivePath(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}