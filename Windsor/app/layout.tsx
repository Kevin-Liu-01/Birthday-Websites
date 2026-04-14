import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Verification Required",
  description: "Please verify you are human",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/vxq6req.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
