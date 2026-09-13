# 아마ON (AMAON)

아마ON은 한끼방패가 운영하는 **아마야구 선수 프로필·영상 포트폴리오 플랫폼**입니다. 학교별 선수 프로필과 경기 영상을 보여주고, 선수의 기록과 이야기를 개인 링크로 공유할 수 있도록 만든 서비스입니다.

운영 주소: https://www.amaon.kr

## 기술 구성

- Next.js 16 / React 19 / TypeScript
- Supabase Auth, Database, Storage
- Vercel 배포 및 Analytics
- PWA 지원

## 로컬 실행

Node.js `>=22.13.0`과 pnpm을 사용합니다.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`에는 실제 Supabase 프로젝트 값을 넣습니다. 비밀키와 운영 환경 변수는 저장소에 커밋하지 않습니다.

## 확인 명령

```bash
pnpm lint
pnpm build
```

변경 범위에 맞는 최소한의 검사를 우선 사용합니다. 문서만 고친 경우에는 전체 빌드가 필요하지 않습니다.

## 주요 위치

- `app/`: 화면, API 라우트, 인증, 선수 프로필 및 서비스 로직
- `supabase/schema.sql`: 데이터베이스 스키마의 저장소 기준본
- `.env.example`: 필요한 환경 변수 이름 예시
- `VERCEL_DEPLOYMENT.md`: Vercel + Supabase 배포 시 참고할 운영 문서
- `AGENTS.md`: Codex/코딩 에이전트용 작업 원칙

## 인증과 데이터

회원 인증은 Supabase Auth를 사용합니다. 서버 코드는 필요한 경우 Supabase 서버 클라이언트를 통해 현재 사용자를 확인하며, 관리자 권한은 서버 환경 변수와 사용자 정보에 기반해 처리합니다.

선수 프로필·미디어·커뮤니티 등 영속 데이터는 Supabase 기반입니다. 데이터베이스 구조를 바꿀 때는 먼저 `supabase/schema.sql`과 관련 코드를 함께 검토하고, 실제 운영 DB 반영은 별도의 명시적 배포 작업으로 다룹니다.

## 배포

운영 배포나 Supabase 설정 변경이 필요한 작업에서만 `VERCEL_DEPLOYMENT.md`를 확인하세요. 일반적인 UI·로직 수정 전에 배포 문서를 읽을 필요는 없습니다.
