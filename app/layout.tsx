import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for now as Poppins needs more config if not standard
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Find Your Match - Speed Dating Event",
  description: "Register for the upcoming speed dating event.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        {children}
      </body>
    </html>
  );
}
