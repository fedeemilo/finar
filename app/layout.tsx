import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FinAR — ¿En qué me conviene invertir hoy?",
  description:
    "Tu asesor financiero amigo. Simple, claro y en argentino. Sin jerga, sin Excel, sin vueltas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${plusJakarta.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
      >
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
