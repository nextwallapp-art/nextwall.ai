import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Instrument_Serif, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NextWall",
  description: "Understand why your investments move",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafafa",
};

const DATA_NODES = [
  [8, 14],
  [14, 22],
  [22, 10],
  [29, 28],
  [35, 16],
  [42, 34],
  [49, 20],
  [57, 12],
  [63, 30],
  [70, 18],
  [76, 36],
  [84, 24],
  [90, 14],
  [12, 48],
  [20, 60],
  [28, 46],
  [36, 58],
  [44, 44],
  [52, 54],
  [60, 42],
  [68, 56],
  [76, 48],
  [84, 62],
  [92, 52],
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative min-h-full font-sans text-[var(--foreground)]">
        <div className="data-grid-background" aria-hidden="true">
          <div className="data-grid-lines" />
          <div className="data-grid-nodes">
            {DATA_NODES.map(([left, top], idx) => (
              <span
                key={`${left}-${top}-${idx}`}
                className="data-node"
                style={{ left: `${left}%`, top: `${top}%` } as CSSProperties}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 flex min-h-full flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
