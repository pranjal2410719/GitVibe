import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

// Google Analytics 4 measurement ID. Override per environment via
// NEXT_PUBLIC_GA_ID (e.g. a Netlify environment variable); defaults to the
// project's ID so analytics work out of the box.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-YLYBKQNCZP";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitvibe.netlify.app",
  ),
  title: {
    default: "GitVibe — Developer Personality Lab",
    template: "%s | GitVibe",
  },
  description:
    "Turn public commits into custom personality profiles. Check your developer aura, track language vibes, and get roasted by your own code activity.",
  keywords: [
    "github profile analyzer",
    "github personality analyzer",
    "github aura",
    "developer personality",
    "github stats",
    "coding personality",
    "github contribution analyzer",
    "developer aura",
    "github activity analyzer",
    "github",
    "personality",
    "profile",
    "analysis",
  ],
  applicationName: "GitVibe",
  category: "developer",
  authors: [{ name: "Pranjal Yadav", url: "https://github.com/pranjal2410719" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "GitVibe — Developer Personality Lab",
    description:
      "Turn public commits into custom personality profiles — aura, chaos, energy, traits, a recruiter report, and a roast, all from live GitHub data.",
    type: "website",
    siteName: "GitVibe",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitVibe — Developer Personality Lab",
    description:
      "Turn public commits into custom personality profiles — aura, chaos, energy, traits, a recruiter report, and a roast.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Connection hints for the third-party APIs the app depends on */}
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://github-contributions-api.jogruber.de" />
        {/* Google tag (gtag.js) — loaded once per page, after hydration */}
        <Script
          id="google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
