"use client";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar"; // Import Navbar
import Footer from "@/components/Footer"; // Import Footer
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isSpecialRoute =
    pathname.startsWith("") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/vendor-signup") ||
    pathname.startsWith("/vendor-signin") ||
    pathname.startsWith("/delivery-signup") ||
    pathname.startsWith("/delivery-signin") ||
    pathname.startsWith("/delivery-dashboard") ||
    pathname.startsWith("/agent-dashboard") ||
    pathname.startsWith("/bdm-dashboard") ||
    pathname.startsWith("/bd-dashboard") ||
    pathname.startsWith("/signin-bdm") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/manager-login") ||
    pathname.startsWith("/vendor-dashboard");

  return (
    <html lang="en">
      <body className="antialiased text-gray-700">
        <ToastContainer />
        <AppContextProvider>
          {!isSpecialRoute && <Navbar />}
          {children}
          {!isSpecialRoute && <Footer />}
        </AppContextProvider>
      </body>
    </html>
  );
}
