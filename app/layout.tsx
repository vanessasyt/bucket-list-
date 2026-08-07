import type { Metadata } from "next";
import { Big_Shoulders_Display, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-big-shoulders",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Tudor & Vanessa — Passport",
  description: "Places we've been, things we've done, meals we've made.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${bigShoulders.variable} ${newsreader.variable} ${plexMono.variable} font-body min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
