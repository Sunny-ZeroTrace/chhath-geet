import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundMedia from "@/components/layout/Background";
import PlayerProvider from "@/components/music/PlayerProvider";
import MusicPlayer from "@/components/music/MusicPlayer";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Chhath Geet — Traditional Chhath Songs",
    template: "%s | Chhath Geet",
  },
  description:
    "A peaceful digital home for Chhath Geet — browse, search, and listen to traditional songs of faith and the river.",
  openGraph: {
    title: "Chhath Geet — Traditional Chhath Songs",
    description:
      "A peaceful digital home for Chhath Geet — browse, search, and listen to traditional songs of faith and the river.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${devanagari.variable}`}>
      <body className="font-body">
        <BackgroundMedia type="video" src="/assets/chhath-ghat-sunrise.mp4" />
        <PlayerProvider>
          <div className="flex min-h-screen flex-col pb-24">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <MusicPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
