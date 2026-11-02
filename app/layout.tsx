import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiring assessment",
  description: "Candidate assessment and HR review workspace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
