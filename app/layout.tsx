import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Wall Calendar",
  description: "Frontend engineering challenge solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}