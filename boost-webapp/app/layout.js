import "./globals.css";

export const metadata = {
  title: "360 Comunicación — Cuentas y Contenido",
  description: "Panel interno de gestión de cuentas y planificación de contenido",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
