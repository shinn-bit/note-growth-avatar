import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "note継続アプリ",
  description: "投稿するたびに自分の分身が成長するnote継続アプリ",
  openGraph: {
    title: "note継続アプリ",
    description: "投稿するたびに自分の分身が成長するnote継続アプリ",
    url: "https://note-growth-avatar.vercel.app",
    siteName: "note継続アプリ",
    images: [
      {
        url: "/ogp/og-image.png",
        width: 1200,
        height: 630,
        alt: "note継続アプリ",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "note継続アプリ",
    description: "投稿するたびに自分の分身が成長するnote継続アプリ",
    images: ["/ogp/og-image.png"],
  },
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
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
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
