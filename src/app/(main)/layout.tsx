"use client";
import { SideBarMenu } from "@/components";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  if (!session && status !== "loading") redirect("/login");
  if (status === "loading") return <div>Cargando sesión...</div>;
  const logout = () => {
    signOut();
  };
  const name = session?.user.name;
  return (
    <div className="antialiased flex flex-col md:grid md:grid-cols-12 gap-4">
      <div className="md:col-span-2">
        <SideBarMenu />
      </div>
      <div className="md:col-span-10 px-4">{children}</div>
      <div className="absolute top-5 right-5 flex justify-center items-center flex-col">
        <img
          onClick={logout}
          className="hover:cursor-pointer"
          src="/logout.png"
          alt="Logout"
          width={35}
          height={35}
        />
        <p>{name && name?.length > 6 ? name?.substring(0, 6) + " ..." : name}</p>
      </div>
    </div>
  );
}
