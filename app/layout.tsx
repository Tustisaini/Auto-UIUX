import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const appFont = DM_Sans({
  subsets:['latin']
})

export const metadata: Metadata = {
  title: "AutoUIUX Generator ",
  description: "Generate Designs for your App and Website using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       className={appFont.className}
      >
        {children}
      </body>
    </html>
  );
}
