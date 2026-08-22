export const MEMBER_ROLES = [
  "player", "guardian", "coach", "baseball_staff", "fan",
] as const;

export type MemberRole = typeof MEMBER_ROLES[number];

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  player: "선수 본인",
  guardian: "보호자",
  coach: "지도자·학교 관계자",
  baseball_staff: "기타 야구 관계자",
  fan: "일반 야구팬",
};

export const COMMUNITY_CATEGORIES = [
  ["free", "자유게시판"],
  ["cheer", "경기 후기·응원"],
  ["news", "선수·학교 소식"],
  ["question", "야구 질문"],
  ["training", "장비·훈련 정보"],
  ["report", "운영팀 제보·수정 요청"],
] as const;

export function activityLevel(points = 0) {
  if (points >= 1000) return "레전드";
  if (points >= 400) return "올스타";
  if (points >= 150) return "주전";
  if (points >= 40) return "유망주";
  return "루키";
}

export function identityBadge(role: string, status: string, adminRole?: string | null) {
  if (adminRole === "admin") return "운영자";
  if (adminRole === "assistant") return "부운영자";
  if (status !== "verified") return "인증 대기";
  return ({
    player: "인증 선수",
    guardian: "인증 보호자",
    coach: "인증 지도자",
    baseball_staff: "야구 관계자",
    fan: "인증 회원",
  } as Record<string, string>)[role] || "인증 회원";
}

const unsafePatterns = [
  /(?:01[016789])[-.\s]?\d{3,4}[-.\s]?\d{4}/,
  /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i,
  /(?:https?:\/\/|www\.)/i,
  /(?:카톡|카카오톡|인스타|instagram|텔레그램)\s*(?:아이디|id|dm|디엠)?/i,
  /(?:집주소|사는\s*곳|학교\s*주소)\s*[:：]/i,
];

const abusivePatterns = [
  /(?:시발|씨발|개새끼|병신|좆|꺼져)/i,
  /(?:죽여|죽어|자살해)/i,
];

export function communityContentError(...values: string[]) {
  const text = values.join(" ");
  if (unsafePatterns.some((pattern) => pattern.test(text))) {
    return "연락처·이메일·SNS 아이디·주소·외부 링크는 게시할 수 없습니다.";
  }
  if (abusivePatterns.some((pattern) => pattern.test(text))) {
    return "욕설·비하·위협 표현은 게시할 수 없습니다.";
  }
  return "";
}
