"use client";
import { SideBarMenu } from "@/components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased flex flex-col md:grid md:grid-cols-12 gap-4">
      <div className="md:col-span-2">
        <SideBarMenu />
      </div>
      <div className="md:col-span-10 px-4">{children}</div>
    </div>
  );
}
