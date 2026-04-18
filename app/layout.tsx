import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brandle — Wordle for brand names",
  description:
    "A daily word puzzle where the answer is a brand. The length changes every day.",
  metadataBase: new URL("https://brandle.today"),
  openGraph: {
    title: "Brandle — Wordle for brand names",
    description: "Guess the brand. A new puzzle every day.",
    url: "https://brandle.today",
    siteName: "Brandle",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brandle — Wordle for brand names",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brandle — Wordle for brand names",
    description: "Guess the brand. A new puzzle every day.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "1024x1024", type: "image/png" }],
    shortcut: ["/favicon.png"],
    apple: [{ url: "/favicon.png", sizes: "1024x1024", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function() {
            try {
              var t = localStorage.getItem('brandle.theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else if (t === 'light') {
                document.documentElement.classList.add('light');
              }
            } catch(e) {}
          })();
        `}</Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
