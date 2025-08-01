import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import AuthSessionProvider from "@/components/auth/session-provider";

export const metadata: Metadata = {
  title: "SkyLensAI - Flight Log Analysis Platform",
  description: "AI-powered flight log analysis and visualization platform for drone and aircraft operators",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <AuthSessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
