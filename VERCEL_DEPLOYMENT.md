# AMAON Vercel + Supabase 배포

1. Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. Authentication > URL Configuration에서 Vercel 주소와 `/login`을 허용합니다.
3. Vercel 환경 변수에 `.env.example`의 네 값을 등록합니다.
4. Build Command는 `pnpm build`, Framework Preset은 Next.js로 둡니다.

사진과 영상은 브라우저에서 Supabase Storage로 직접 전송됩니다. 영상은 6MB 단위 TUS 재개 가능 업로드를 사용하므로 Vercel 요청 크기 제한을 받지 않습니다.
