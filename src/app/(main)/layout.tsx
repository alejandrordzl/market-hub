"use client";
import { SideBarMenu } from "@/components";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";

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
    <div className="antialiased flex flex-col md:flex-row">
      <div className="md:w-70 md:flex-shrink-0">
        <SideBarMenu />
      </div>
      <div className="flex-1 px-4">{children}</div>
      <div className="absolute top-5 right-5 flex justify-center items-center flex-col">
        <Image
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
