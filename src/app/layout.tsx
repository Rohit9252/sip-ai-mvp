import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari, Public_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Latin letters and digits. Public Sans has tabular numerals, so the rupee amounts line up.
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

// Hindi (Devanagari). It covers the vowel marks and the conjuncts, and pairs with Public Sans in size and weight.
const notoDeva = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Your SIP, explained",
  description:
    "A concept for a Groww-style SIP page. When your SIP value falls below what you put in, it shows what moved your money. Made for a graduation project. Not investment advice.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} ${notoDeva.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
