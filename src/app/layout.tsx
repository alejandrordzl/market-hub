import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SideBarMenu from "./components/sideBarMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abarrotes Lulu",
  description: "This is a point of sale system for Abarrotes Lulu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/icon.png"
          type="image/png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grid grid-cols-12 gap-4`}
      >
        <div className="col-span-1 md:col-span-2">
          <SideBarMenu />
        </div>
        <div className="col-span-11 md:col-span-10">
          {children}
        </div>
      </body>
    </html>
  );
}
