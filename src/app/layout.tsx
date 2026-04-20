import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-vf-navy text-vf-sand antialiased font-body texture-grain min-h-screen relative">
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-vf-navy">
          <Image
            src="https://static.wixstatic.com/media/456ff2_4c565c673662441990a8983ef56bbc4b~mv2.png/v1/fill/w_1570,h_926,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/456ff2_4c565c673662441990a8983ef56bbc4b~mv2.png"
            alt="Ventura from sky"
            fill
            priority
            className="h-full w-full object-cover mix-blend-luminosity opacity-20 block"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-vf-navy/40 to-vf-navy/90" />
        </div>
        {children}
      </body>
    </html>
  );
}
