import * as XLSX from "xlsx";
import { apiAdmin } from "../../../api-auth";
import { MEMBER_ROLE_LABELS, MEMBER_ROLES, activityLevel, type MemberRole } from "../../../community-model";
import { createSupabaseAdminClient } from "../../../supabase/admin";

const identityStatusLabels: Record<string, string> = {
  pending: "인증 대기",
  verified: "인증 완료",
  rejected: "인증 반려",
};

type ExportMember = {
  member_role: string;
  identity_status: string;
  created_at: string | null;
  display_name: string | null;
  email: string | null;
  school_name: string | null;
  related_player_name: string | null;
  activity_points: number | null;
  updated_at: string | null;
};

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9가-힣_-]/g, "-");
}

export async function GET(request: Request) {
  const { role: adminRole } = await apiAdmin();
  if (!adminRole) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });

  const requestedRole = new URL(request.url).searchParams.get("role") || "all";
  if (requestedRole !== "all" && !MEMBER_ROLES.includes(requestedRole as MemberRole)) {
    return Response.json({ error: "올바른 회원 구분이 아닙니다." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const members: ExportMember[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let query = supabase.from("member_profiles").select("*").order("created_at", { ascending: false }).range(from, from + pageSize - 1);
    if (requestedRole !== "all") query = query.eq("member_role", requestedRole);
    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    members.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  const summaryRows = MEMBER_ROLES.map((role) => ({
    "회원 구분": MEMBER_ROLE_LABELS[role],
    "가입 인원": members.filter((member) => member.member_role === role).length,
    "인증 완료": members.filter((member) => member.member_role === role && member.identity_status === "verified").length,
  }));
  summaryRows.push({
    "회원 구분": "합계",
    "가입 인원": members.length,
    "인증 완료": members.filter((member) => member.identity_status === "verified").length,
  });

  const memberRows = members.map((member, index) => ({
    "No": index + 1,
    "가입일": String(member.created_at || "").slice(0, 10),
    "회원 구분": MEMBER_ROLE_LABELS[member.member_role as MemberRole] || "일반 야구팬",
    "이름": member.display_name || "",
    "이메일": member.email || "",
    "소속 학교": member.school_name || "",
    "관련 선수": member.related_player_name || "",
    "신원 상태": identityStatusLabels[member.identity_status] || member.identity_status || "",
    "활동 등급": activityLevel(Number(member.activity_points || 0)),
    "활동 점수": Number(member.activity_points || 0),
    "최근 수정일": String(member.updated_at || "").slice(0, 10),
  }));

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  const membersSheet = XLSX.utils.json_to_sheet(memberRows);
  summarySheet["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }];
  membersSheet["!cols"] = [
    { wch: 7 }, { wch: 13 }, { wch: 20 }, { wch: 16 }, { wch: 30 }, { wch: 24 },
    { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "회원현황");
  XLSX.utils.book_append_sheet(workbook, membersSheet, "회원목록");
  const output = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const roleLabel = requestedRole === "all" ? "전체회원" : MEMBER_ROLE_LABELS[requestedRole as MemberRole];
  const filename = safeFilename(`AMAON-${roleLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`);

  return new Response(output, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
