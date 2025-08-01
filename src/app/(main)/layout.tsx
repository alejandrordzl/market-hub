"use client";
import { SideBarMenu } from "@/components";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session , status } = useSession();
  if (!session && status !== "loading") redirect("/login");
  if (status === "loading") return <div>Cargando sesión...</div>;
  return (
    <div className="antialiased flex flex-col md:grid md:grid-cols-12 gap-4">
      <div className="md:col-span-2">
        <SideBarMenu />
      </div>
      <div className="md:col-span-10 px-4">{children}</div>
    </div>
  );
}
