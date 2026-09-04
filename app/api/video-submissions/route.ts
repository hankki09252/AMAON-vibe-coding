import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { managedTeamLabel } from "../../team-directory";

const bucket = "media";
const maxBytes = 150 * 1024 * 1024;
const maxSeconds = 90;
const categories = new Set(["pitching", "batting", "fielding"]);
const relationships = new Set(["player", "guardian"]);
const allowedTypes = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"]);
const visitorCookie = "amaon_visitor";

type SubmissionRow = {
  id: string; team_id: string; player_id: string; player_name: string; school_name: string;
  category: string; relationship: string; contact: string; original_name: string; storage_key: string;
  content_type: string; file_size: number; duration_seconds: number; status: string; review_reason: string;
  social_consent: boolean; created_at: string; uploaded_at: string | null; reviewed_at: string | null;
};

function cleanName(value: string) {
  return value.replace(/[\r\n\0]/g, " ").trim().slice(0, 120);
}

function safeExtension(name: string, contentType: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (extension && ["mp4", "mov", "webm", "m4v"].includes(extension)) return extension;
  return contentType === "video/quicktime" ? "mov" : contentType === "video/webm" ? "webm" : "mp4";
}

async function completeUpload(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "등록 번호가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const { data: row, error } = await db.from("video_submissions").select("*").eq("id", id).eq("status", "uploading").maybeSingle();
  if (error || !row) return Response.json({ error: "업로드 요청을 찾지 못했습니다." }, { status: 404 });
  const storageKey = String(row.storage_key);
  const slash = storageKey.lastIndexOf("/");
  const folder = storageKey.slice(0, slash);
  const filename = storageKey.slice(slash + 1);
  const { data: objects, error: listError } = await db.storage.from(bucket).list(folder, { search: filename, limit: 10 });
  const object = objects?.find((item) => item.name === filename);
  const storedSize = Number(object?.metadata?.size || 0);
  const storedType = String(object?.metadata?.mimetype || row.content_type || "");
  if (listError || !object || storedSize <= 0) return Response.json({ error: "영상 업로드가 아직 완료되지 않았습니다." }, { status: 409 });
  if (storedSize > maxBytes || !allowedTypes.has(storedType)) {
    await db.storage.from(bucket).remove([storageKey]);
    await db.from("video_submissions").update({ status: "rejected", review_reason: "파일 규격 오류", reviewed_at: new Date().toISOString() }).eq("id", id);
    return Response.json({ error: "영상은 MP4·MOV·WEBM 형식, 최대 150MB까지 등록할 수 있습니다." }, { status: 400 });
  }
  const { error: updateError } = await db.from("video_submissions").update({ status: "pending", file_size: storedSize, content_type: storedType, uploaded_at: new Date().toISOString() }).eq("id", id).eq("status", "uploading");
  if (updateError) return Response.json({ error: "승인 요청으로 전환하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true, submissionId: id });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (body.action === "complete") return completeUpload(String(body.submissionId || ""));

  const teamId = String(body.teamId || "");
  const playerId = String(body.playerId || "");
  const category = String(body.category || "");
  const relationship = String(body.relationship || "");
  const contact = cleanName(String(body.contact || ""));
  const originalName = cleanName(String(body.fileName || "video.mp4"));
  const contentType = String(body.contentType || "video/mp4").toLowerCase();
  const fileSize = Number(body.fileSize || 0);
  const durationSeconds = Math.ceil(Number(body.durationSeconds || 0));
  const consent = body.consent === true;
  const socialConsent = body.socialConsent === true;
  if (!validTeamId(teamId) || !managedTeamLabel[teamId] || !validPlayerId(playerId) || !categories.has(category)
    || !relationships.has(relationship) || contact.length < 5 || !consent || !allowedTypes.has(contentType)
    || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxBytes
    || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > maxSeconds) {
    return Response.json({ error: "선수, 연락처, 영상 규격과 동의 항목을 다시 확인해 주세요." }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const { data: player } = await db.from("roster_players").select("player_id,team_id,name,hidden").eq("player_id", playerId).eq("team_id", teamId).eq("hidden", false).maybeSingle();
  if (!player) return Response.json({ error: "현재 공개된 선수 명단에서 선수를 찾지 못했습니다." }, { status: 404 });

  const cookieStore = await cookies();
  let visitorId = cookieStore.get(visitorCookie)?.value;
  if (!visitorId || !/^[a-f0-9-]{36}$/.test(visitorId)) visitorId = randomUUID();
  const requesterHash = createHash("sha256").update(`${visitorId}:${contact.toLowerCase()}`).digest("hex");
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await db.from("video_submissions").select("id", { count: "exact", head: true }).eq("requester_hash", requesterHash).gte("created_at", since);
  if ((count || 0) >= 3) return Response.json({ error: "하루 등록 가능 횟수는 3개입니다. 내일 다시 이용해 주세요." }, { status: 429 });

  const id = randomUUID();
  const extension = safeExtension(originalName, contentType);
  const storageKey = `submissions/${id}/video.${extension}`;
  const { error: insertError } = await db.from("video_submissions").insert({
    id, team_id: teamId, player_id: playerId, player_name: player.name, school_name: managedTeamLabel[teamId],
    category, relationship, contact, consent, social_consent: socialConsent, original_name: originalName, storage_key: storageKey,
    content_type: contentType, file_size: Math.round(fileSize), duration_seconds: durationSeconds, requester_hash: requesterHash,
  });
  if (insertError) return Response.json({ error: "등록 요청을 만들지 못했습니다." }, { status: 500 });
  const { data: signed, error: signedError } = await db.storage.from(bucket).createSignedUploadUrl(storageKey);
  if (signedError || !signed?.token) {
    await db.from("video_submissions").delete().eq("id", id);
    return Response.json({ error: "영상 업로드 주소를 만들지 못했습니다." }, { status: 500 });
  }
  const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  const response = Response.json({ submissionId: id, storageKey, token: signed.token, uploadEndpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable` }, { status: 201 });
  response.headers.append("Set-Cookie", `${visitorCookie}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET() {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("video_submissions").select("id,team_id,player_id,player_name,school_name,category,relationship,contact,social_consent,original_name,storage_key,content_type,file_size,duration_seconds,status,review_reason,created_at,uploaded_at,reviewed_at").in("status", ["pending", "approved", "rejected"]).order("created_at", { ascending: false }).limit(40);
  if (error) return Response.json({ error: "영상 등록 요청을 불러오지 못했습니다." }, { status: 500 });
  const rows = (data || []) as SubmissionRow[];
  const downloadable = rows.filter((row) => row.status !== "rejected");
  const signed = await Promise.all(downloadable.map(async (row) => ({ id: row.id, preview: (await db.storage.from(bucket).createSignedUrl(row.storage_key, 20 * 60)).data?.signedUrl || "", download: (await db.storage.from(bucket).createSignedUrl(row.storage_key, 20 * 60, { download: row.original_name || "amaon-video" })).data?.signedUrl || "" })));
  const urlById = new Map(signed.map((item) => [item.id, item]));
  return Response.json({ items: rows.map((row) => ({ ...row, previewUrl: urlById.get(row.id)?.preview || "", downloadUrl: urlById.get(row.id)?.download || "" })) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = String(body.submissionId || "");
  const action = String(body.action || "");
  if (!/^[a-f0-9-]{36}$/.test(id) || !["approve", "reject"].includes(action)) return Response.json({ error: "처리 정보가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const { data: row } = await db.from("video_submissions").select("*").eq("id", id).eq("status", "pending").maybeSingle();
  if (!row) return Response.json({ error: "이미 처리되었거나 찾을 수 없는 요청입니다." }, { status: 409 });
  if (action === "reject") {
    const reason = cleanName(String(body.reason || "운영 기준에 맞지 않는 영상"));
    await db.storage.from(bucket).remove([row.storage_key]);
    const { error } = await db.from("video_submissions").update({ status: "rejected", review_reason: reason, reviewed_at: new Date().toISOString(), reviewed_by: user.email }).eq("id", id).eq("status", "pending");
    if (error) return Response.json({ error: "반려 처리를 저장하지 못했습니다." }, { status: 500 });
    return Response.json({ ok: true });
  }

  const extension = safeExtension(row.original_name, row.content_type);
  const finalKey = `teams/${row.team_id}/players/${row.player_id}/${row.category}/${Date.now()}-${id}.${extension}`;
  const { error: moveError } = await db.storage.from(bucket).move(row.storage_key, finalKey);
  if (moveError) return Response.json({ error: "승인 영상을 공개 보관함으로 옮기지 못했습니다." }, { status: 500 });
  const mediaPlayerId = `${row.team_id}--${row.player_id}`;
  const { error: mediaError } = await db.from("media_items").insert({ storage_key: finalKey, player_id: mediaPlayerId, category: row.category, content_type: row.content_type, uploaded_by: user.email });
  if (mediaError) {
    await db.storage.from(bucket).move(finalKey, row.storage_key);
    return Response.json({ error: "선수 프로필에 영상을 연결하지 못했습니다." }, { status: 500 });
  }
  const { error: updateError } = await db.from("video_submissions").update({ storage_key: finalKey, status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.email }).eq("id", id).eq("status", "pending");
  if (updateError) return Response.json({ error: "승인 상태를 저장하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true, profileUrl: `/?team=${encodeURIComponent(row.team_id)}&player=${encodeURIComponent(row.player_id)}#${encodeURIComponent(row.team_id)}` });
}
