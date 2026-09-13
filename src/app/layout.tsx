import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/register-service-worker";

export const metadata: Metadata = {
  title: "MasjidLove",
  description: "Events and salah for the masjids around you.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MasjidLove",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="light" data-theme="light">
      <body className="flex min-h-full flex-col antialiased">
        <RegisterServiceWorker />
        <div className="app-frame flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
