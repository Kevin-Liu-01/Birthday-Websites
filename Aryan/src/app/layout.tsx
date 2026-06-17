import type { Metadata, Viewport } from "next";
import { Anton, Pirata_One, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const pirata = Pirata_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pirata",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "ARYAN \u271F BORN IN THE DARK",
  description: "A birthday shrine. Opium aesthetic, liquid chrome, and the archive.",
  openGraph: {
    title: "ARYAN \u271F HAPPY BIRTHDAY",
    description: "A birthday shrine. Opium aesthetic, liquid chrome, and the archive.",
    images: ["/photos/photo-01.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${pirata.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full text-foreground">{children}</body>
    </html>
  );
}
