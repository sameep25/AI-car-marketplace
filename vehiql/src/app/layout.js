import { Inter } from "next/font/google";
import "./globals.css";
import header from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Vehiql",
  description: "Find your dream car",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <header />

        <main className="min-h-screen">{children}</main>

        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Made by Sameep Vishwakarma</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
