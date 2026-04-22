import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban",
  description: "Tableau Kanban collaboratif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-BE">
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
