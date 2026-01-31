import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider"; // match exact filename

const appFont = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoUIUX Generator",
  description: "Generate Designs for your App and Website using AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={appFont.className}>
          <Provider>
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
