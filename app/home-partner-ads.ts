export type HomePartnerAd = {
  id: string;
  title: string;
  detail: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
};

// Add future approved partner ads here; the home banner becomes swipeable automatically.
export const homePartnerAds: HomePartnerAd[] = [
  {
    id: "nutricost-creatine-300g",
    title: "뉴트리코스트 크레아틴 분말",
    detail: "300g · 상품 정보는 쿠팡에서 확인하세요",
    href: "https://link.coupang.com/a/h07R4a0jjo",
    imageUrl: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2372222342799546-6ba1af63-1b6f-4b3c-8205-e0c674556dbd.jpg",
    imageAlt: "뉴트리코스트 크레아틴 분말 300g 상품 사진",
  },
];
