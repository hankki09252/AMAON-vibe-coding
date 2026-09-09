import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import SiteAnalytics from "./site-analytics";
import "./globals.css";
import "./theme.css";
import PwaRegister from "./pwa-register";

export async function generateMetadata(): Promise<Metadata> {
  const origin = "https://www.amaon.kr";

  return {
    metadataBase: new URL(origin),
    title: "아마온(아마ON) | 아마야구 선수 프로필·영상 포트폴리오",
    description: "아마온(아마ON)은 한끼방패가 운영하는 아마야구 선수 포트폴리오 플랫폼입니다. 학교별 선수 프로필과 경기 영상을 확인하고, 선수의 이야기를 개인 링크로 공유하세요.",
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION ?? "FWxsCdCszxMRIq47xEGh1elBUuHvZIdA3rWafCLqE1Q", other: process.env.NAVER_SITE_VERIFICATION ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION } : undefined },
    openGraph: {
      title: "아마온(아마ON) | 한끼방패",
      siteName: "아마온",
      locale: "ko_KR",
      description: "기록은 결과를, 영상은 과정을, 프로필은 선수의 이야기를 보여줍니다.",
      images: [{ url: `${origin}/og.png`, width: 1731, height: 909 }],
      type: "website",
    },
    twitter: { card: "summary_large_image", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#ff6200" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="아마ON" />
      </head>
      <body>
        <PwaRegister />
        {children}
        <SiteAnalytics />
        <Analytics mode="production" />
      </body>
    </html>
  );
}
