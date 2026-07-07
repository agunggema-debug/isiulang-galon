import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Water fresh - Air Galon & Gas Elpiji Terpercaya",
  description: "Platform e-commerce premium untuk pemesanan air galon murni dan gas elpiji berkualitas tinggi. Layanan antar cepat, higienis, dan terpercaya.",
  keywords: ["air galon", "gas elpiji", "isi ulang air", "gas 3kg", "air mineral", "water fresh"],
  icons: {
    icon: "/logo.ico",
  },
  openGraph: {
    title: "Water Fresh - Air Galon & Gas Elpiji Terpercaya",
    description: "Platform e-commerce premium untuk pemesanan air galon murni dan gas elpiji berkualitas tinggi.",
    type: "website",
    locale: "id_ID",
    siteName: "Water Fresh",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          {/* Chatbot only appears on public pages, not in admin */}
        </AuthProvider>
      </body>
    </html>
  );
}
