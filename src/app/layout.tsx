import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ventura Forward",
  description: "Ventura Forward community app",
  applicationName: "Ventura Forward",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ventura Forward",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0C1A2E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} dark`}>
      <body className="bg-vf-navy text-vf-sand antialiased font-body texture-grain min-h-screen relative">
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-vf-navy">
          <Image
            src="/images/ventura/ventura-fade-2.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="h-full w-full object-cover mix-blend-luminosity opacity-20 block"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-vf-navy/40 to-vf-navy/90" />
        </div>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
