# AMAON Vercel + Supabase 배포

이 문서는 실제 배포나 운영 환경 설정을 변경할 때만 참고합니다. 일반적인 UI·로직 수정에는 필요하지 않습니다.

1. Supabase 프로젝트의 SQL Editor에서 저장소의 `supabase/schema.sql` 중 필요한 변경을 검토해 적용합니다. 운영 DB에는 코드 변경과 별개로 명시적으로 반영합니다.
2. Supabase Authentication의 URL Configuration에 운영 도메인과 로그인 흐름에 필요한 URL을 등록합니다.
3. Vercel 환경 변수는 `.env.example`을 기준으로 등록합니다. Supabase 관련 값과 `ADMIN_EMAILS`를 확인하고, Telegram 연동을 사용하는 경우에만 Telegram 변수를 추가합니다.
4. Framework Preset은 Next.js, Build Command는 `pnpm build`를 사용합니다.

사진과 영상은 브라우저에서 Supabase Storage로 직접 전송됩니다. 영상 업로드는 TUS 재개 가능 업로드를 사용하므로 애플리케이션 서버를 통해 대용량 파일 전체를 전달하지 않습니다.

실제 배포 전에는 최소한 `pnpm build`를 통과시키고, 인증·업로드·관리자 기능처럼 변경된 흐름만 추가로 점검합니다.
