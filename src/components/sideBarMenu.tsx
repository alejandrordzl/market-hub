"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SideBarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProducts = () => {
    setIsProductsExpanded(!isProductsExpanded);
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      {!isOpen ? (
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
      ) : (
        <button
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
      )}

      {/* Sidebar Menu */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
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
          {/* Products Menu */}
          <div className="mb-2">
            <button
              onClick={toggleProducts}
              className="w-full py-2 px-2 md:px-4 hover:bg-gray-700 rounded text-lg md:text-xl flex items-center justify-between md:pointer-events-none"
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
              {/* Arrow icon - only visible on mobile */}
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 md:hidden ${
                  isProductsExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {/* Submenu - always visible on desktop, toggleable on mobile */}
            <div className={`${isProductsExpanded ? 'block' : 'hidden'} md:block ml-4 mt-1`}>
              <Link
                href="/products"
                className="block py-1.5 px-3 text-sm md:text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => setIsOpen(false)} // Close mobile menu when clicking submenu
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Ver lista de productos
                </div>
              </Link>
              
              <Link
                href="/products/add"
                className="block py-1.5 px-3 text-sm md:text-base text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => setIsOpen(false)} // Close mobile menu when clicking submenu
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Agregar producto
                </div>
              </Link>
            </div>
          </div>
          {/* <Link
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
          </Link> */}
        </nav>
      </div>
    </div>
  );
}
