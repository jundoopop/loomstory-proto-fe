import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "VintEdge — Good clothes. Better stories.",
  description:
    "Explore the archive. Discover the context. A transparent vintage discovery prototype.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
