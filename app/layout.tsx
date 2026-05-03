import type { Metadata } from "next";
import { Geist_Mono, Dancing_Script, DM_Serif_Display, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "./lib/session-provider";
import { SwRegister } from "./lib/sw-register";
import { SplashGate } from "./components/SplashGate";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const APP_URL = "https://note-growth-avatar.vercel.app";
const APP_TITLE = "note TREE｜投稿を続けると植物が育つnote継続サポートアプリ";
const APP_DESCRIPTION =
  "noteを投稿するたびに植物が育つ継続サポートアプリ。投稿をサボると枯れていく。反応がなくても努力を可視化して、習慣化をサポートします。";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  keywords: ["note", "継続", "習慣化", "投稿", "植物", "サポートアプリ", "収益化", "ブログ"],
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: "note TREE",
    images: [
      {
        url: "/ogp/og-image.png",
        width: 1200,
        height: 630,
        alt: APP_TITLE,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/ogp/og-image.png"],
  },
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "Y0AcPbEtxQeoB8hxoucUuJzEK44aEPOUSsXKrWOme98",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistMono.variable} ${dancingScript.variable} ${dmSerifDisplay.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "note TREE",
                url: APP_URL,
                description: APP_DESCRIPTION,
                applicationCategory: "LifestyleApplication",
                operatingSystem: "Web",
                inLanguage: "ja",
                offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
              }),
            }}
          />
          <SwRegister />
          <AuthSessionProvider>
            <SplashGate>{children}</SplashGate>
          </AuthSessionProvider>
        </body>
    </html>
  );
}
