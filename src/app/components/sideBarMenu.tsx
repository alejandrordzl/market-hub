import Image from "next/image";
import Link from "next/link";
export default function SideBarMenu() {
    return (
        <div className="flex flex-col h-screen bg-gray-800 text-white">
            <div className="flex items-center justify-center">
                <a href="/">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={150}
                        height={75}
                    />
                </a>
            </div>
            <nav className="flex flex-col p-4">
                <Link href="/products" className="py-2 px-4 hover:bg-gray-700 rounded text-xl">
                    <div className="flex items-center">
                        <Image
                            src="/products.png"
                            alt="Products"
                            width={24}
                            height={24}
                            className="inline-block mr-2"
                        />
                        <span>Productos</span>
                    </div>
                </Link>
                <Link href="/sales" className="py-2 px-4 hover:bg-gray-700 rounded text-xl">
                    <div className="flex items-center">
                        <Image
                            src="/sales.png"
                            alt="Sales"
                            width={24}
                            height={24}
                            className="inline-block mr-2"
                        />
                        <span>Ventas</span>
                    </div>
                </Link>
            </nav>
        </div>
    );
}