import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumos Companion",
  description:
    "A compassionate mental health companion with voice and immersive 3D presence."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
