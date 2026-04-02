import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Mantém o PWA desligado no seu localhost para não atrapalhar os testes
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações originais do Next ficam aqui
};

export default withPWA(nextConfig);