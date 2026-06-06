import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext"; // 1. Importe o Provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VendaFácil",
  description: "Controle de vendas por voz",
  manifest: "/manifest.json", // Importante manter para o PWA depois
};

// ADICIONE ESTE BLOCO AQUI: Isso diz ao celular para não diminuir o site
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* 2. Abrace o children com o Provider */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}