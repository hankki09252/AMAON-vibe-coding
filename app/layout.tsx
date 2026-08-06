import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./theme.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "야마ON | 아마야구의 모든 순간",
    description: "고교야구 학교 정보와 선수 프로필, 기록과 영상을 한곳에서 만나는 아마야구 플랫폼",
    openGraph: {
      title: "야마ON by 한끼방패",
      description: "오늘의 선수를 내일의 이름으로",
      images: [{ url: `${origin}/og.png`, width: 1731, height: 909 }],
      type: "website",
    },
    twitter: { card: "summary_large_image", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
