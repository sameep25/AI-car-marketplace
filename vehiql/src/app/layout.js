import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header";

import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Vehiql",
  description: "Find your dream car",
};

export default function RootLayout({ children }) {
  return (
    // wrapping the app in clerk
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />

          <main className="min-h-screen">{children}</main>

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made by Sameep Vishwakarma</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
