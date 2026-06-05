import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Mantém o PWA desligado no seu localhost para não atrapalhar os testes
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Libera o IP do seu celular para acessar o servidor de desenvolvimento
  allowedDevOrigins: ['192.168.0.107'],
};

export default nextConfig;

