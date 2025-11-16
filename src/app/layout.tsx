import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "YKS Takip AI",
  description:
    "TYT-AYT hazırlığını günlük kayıt, hedefler ve analizlerle uçtan uca yöneten platform.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn(inter.variable, "bg-slate-50 dark:bg-slate-950")}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

