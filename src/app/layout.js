import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// O bloco original fica apenas com os dados de texto e o manifest
export const metadata = {
  title: "App de Vendas",
  description: "Registro rápido de clientes",
  manifest: "/manifest.json", 
};

// CRIE ESTE BLOCO NOVO AQUI:
export const viewport = {
  themeColor: "#22c55e",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
