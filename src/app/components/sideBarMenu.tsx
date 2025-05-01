'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SideBarMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            {/* Hamburger Button */}
            {
                !isOpen ?
                    <button
                        className="md:hidden p-4 text-white bg-gray-800"
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        </svg>
                    </button>
                    : <button
                        className="p-4 text-white bg-gray-800 z-3 absolute top-0 right-0"
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
            }


            {/* Sidebar Menu */}
            <div
                className={`${isOpen ? "block" : "hidden"
                    } md:flex flex-col h-screen bg-gray-800 text-white w-full md:w-auto absolute md:static top-0 left-0 z-2`}
            >
                <div className="flex items-center justify-center p-4">
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={100}
                            height={50}
                            className="md:w-[150px] md:h-[75px]"
                        />
                    </Link>
                </div>
                <nav className="flex flex-col p-2 md:p-4">
                    <Link
                        href="/products"
                        className="py-2 px-2 md:px-4 hover:bg-gray-700 rounded text-lg md:text-xl"
                    >
                        <div className="flex items-center">
                            <Image
                                src="/products.png"
                                alt="Products"
                                width={20}
                                height={20}
                                className="inline-block mr-2"
                            />
                            <span>Productos</span>
                        </div>
                    </Link>
                    <Link
                        href="/sales"
                        className="py-2 px-2 md:px-4 hover:bg-gray-700 rounded text-lg md:text-xl"
                    >
                        <div className="flex items-center">
                            <Image
                                src="/sales.png"
                                alt="Sales"
                                width={20}
                                height={20}
                                className="inline-block mr-2"
                            />
                            <span>Ventas</span>
                        </div>
                    </Link>
                </nav>
            </div>
        </div>
    );
}