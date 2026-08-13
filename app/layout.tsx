import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Food Diary",
  description: "Every café, restaurant and home-cooked meal, on a map.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${plexMono.variable} font-body min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
