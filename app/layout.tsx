import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "me.AI — Rent an Expert's Brain at Midnight",
  description: "Marketplace of expert review packs. Get instant, high-rigor AI reviews citing exact expert rubrics and rules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-parchment text-off-black antialiased selection:bg-periwinkle-mist">
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            className: "font-mono text-xs border border-ash bg-white text-off-black rounded-[16px] shadow-lg",
          }}
        />
      </body>
    </html>
  );
}
