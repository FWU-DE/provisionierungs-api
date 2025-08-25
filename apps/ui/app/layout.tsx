import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIDIS Rostering",
  description: "A rostering application for VIDIS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
