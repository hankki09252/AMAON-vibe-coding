import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { apiAdmin, validPlayerId, validTeamId } from "../../api-auth";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { managedTeamLabel } from "../../team-directory";

const bucket = "media";
const maxImageBytes = 12 * 1024 * 1024;
const submissionTypes = new Set(["profile", "profile_photo", "photo"]);
const relationships = new Set(["player", "guardian"]);
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const visitorCookie = "amaon_visitor";

type SubmissionRow = {
  id: string; team_id: string; player_id: string; player_name: string; school_name: string;
  submission_type: "profile" | "profile_photo" | "photo"; relationship: "player" | "guardian";
  contact: string; social_consent: boolean; profile_data: Record<string, unknown>; original_name: string;
  storage_key: string | null; content_type: string; file_size: number; status: string; review_reason: string;
  created_at: string; uploaded_at: string | null; reviewed_at: string | null;
};

type ImageRequest = { fileName: string; fileSize: number; contentType: string };

function cleanText(value: unknown, max = 120) {
  return String(value || "").replace(/[\r\0]/g, " ").trim().slice(0, max);
}

function safeImageExtension(name: string, contentType: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) return extension === "jpeg" ? "jpg" : extension;
  return contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
}

function profilePayload(value: unknown) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const output: Record<string, string | number> = {};
  const number = cleanText(input.number, 3);
  const grade = cleanText(input.grade, 10);
  const position = cleanText(input.position, 20);
  const batsThrows = cleanText(input.batsThrows, 20);
  const introduction = cleanText(input.introduction, 500);
  const strengths = cleanText(input.strengths, 300);
  const aspiration = cleanText(input.aspiration, 300);
  const year = Number(input.year);
  const height = Number(input.height);
  const weight = Number(input.weight);
  if (number) output.number = number;
  if (grade) output.grade = grade;
  if (position) output.position = position;
  if (batsThrows) output.batsThrows = batsThrows;
  if (introduction) output.introduction = introduction;
  if (strengths) output.strengths = strengths;
  if (aspiration) output.aspiration = aspiration;
  if (Number.isInteger(year) && year >= 2000 && year <= 2100) output.year = year;
  if (Number.isInteger(height) && height >= 100 && height <= 230) output.height = height;
  if (Number.isInteger(weight) && weight >= 30 && weight <= 200) output.weight = weight;
  return output;
}

async function requesterHash(contact: string) {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(visitorCookie)?.value;
  if (!visitorId || !/^[a-f0-9-]{36}$/.test(visitorId)) visitorId = randomUUID();
  return { visitorId, hash: createHash("sha256").update(`${visitorId}:${contact.toLowerCase()}`).digest("hex") };
}

async function completeUpload(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "등록 번호가 올바르지 않습니다." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const { data: row } = await db.from("player_profile_submissions").select("*").eq("id", id).eq("status", "uploading").maybeSingle();
  if (!row?.storage_key) return Response.json({ error: "업로드 요청을 찾지 못했습니다." }, { status: 404 });
  const slash = row.storage_key.lastIndexOf("/");
  const folder = row.storage_key.slice(0, slash);
  const filename = row.storage_key.slice(slash + 1);
  const { data: objects, error: listError } = await db.storage.from(bucket).list(folder, { search: filename, limit: 10 });
  const object = objects?.find((item) => item.name === filename);
  const storedSize = Number(object?.metadata?.size || 0);
  const storedType = String(object?.metadata?.mimetype || row.content_type || "").toLowerCase();
  if (listError || !object || storedSize <= 0) return Response.json({ error: "사진 업로드가 아직 완료되지 않았습니다." }, { status: 409 });
  if (storedSize > maxImageBytes || !allowedImageTypes.has(storedType)) {
    await db.storage.from(bucket).remove([row.storage_key]);
    await db.from("player_profile_submissions").update({ status: "rejected", review_reason: "파일 규격 오류", reviewed_at: new Date().toISOString() }).eq("id", id);
    return Response.json({ error: "사진은 JPG·PNG·WEBP 형식, 최대 12MB까지 등록할 수 있습니다." }, { status: 400 });
  }
  const { error } = await db.from("player_profile_submissions").update({ status: "pending", file_size: storedSize, content_type: storedType, uploaded_at: new Date().toISOString() }).eq("id", id).eq("status", "uploading");
  if (error) return Response.json({ error: "승인 요청으로 전환하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true, submissionId: id });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (body.action === "complete") return completeUpload(String(body.submissionId || ""));

  const teamId = String(body.teamId || "");
  const playerId = String(body.playerId || "");
  const submissionType = String(body.submissionType || "");
  const relationship = String(body.relationship || "");
  const contact = cleanText(body.contact, 80);
  const consent = body.consent === true;
  const socialConsent = body.socialConsent === true;
  if (!validTeamId(teamId) || !managedTeamLabel[teamId] || !validPlayerId(playerId) || !submissionTypes.has(submissionType)
    || !relationships.has(relationship) || contact.length < 5 || !consent) {
    return Response.json({ error: "선수, 연락처와 동의 항목을 다시 확인해 주세요." }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const { data: player } = await db.from("roster_players").select("player_id,team_id,name,hidden").eq("player_id", playerId).eq("team_id", teamId).eq("hidden", false).maybeSingle();
  if (!player) return Response.json({ error: "현재 공개된 선수 명단에서 선수를 찾지 못했습니다." }, { status: 404 });

  const requester = await requesterHash(contact);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentRequests } = await db.from("player_profile_submissions").select("created_at").eq("requester_hash", requester.hash).gte("created_at", since).limit(40);
  const requestCount = new Set((recentRequests || []).map((row) => row.created_at)).size;
  if (requestCount >= 3) return Response.json({ error: "하루 등록·수정 요청은 최대 3번입니다. 내일 다시 이용해 주세요." }, { status: 429 });

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const base = { id, team_id: teamId, player_id: playerId, player_name: player.name, school_name: managedTeamLabel[teamId], submission_type: submissionType, relationship, contact, consent, social_consent: socialConsent, requester_hash: requester.hash, created_at: createdAt };
  if (submissionType === "profile") {
    const data = profilePayload(body.profileData);
    if (!Object.keys(data).length) return Response.json({ error: "수정할 프로필 내용을 하나 이상 입력해 주세요." }, { status: 400 });
    const { error } = await db.from("player_profile_submissions").insert({ ...base, profile_data: data, status: "pending", content_type: "application/json", file_size: 0 });
    if (error) return Response.json({ error: "프로필 수정 요청을 저장하지 못했습니다." }, { status: 500 });
    const response = Response.json({ ok: true, submissionId: id }, { status: 201 });
    response.headers.append("Set-Cookie", `${visitorCookie}=${requester.visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
    return response;
  }

  if (submissionType === "photo") {
    const requestedFiles = Array.isArray(body.files) ? body.files : body.fileName ? [{ fileName: body.fileName, fileSize: body.fileSize, contentType: body.contentType }] : [];
    const files = requestedFiles.slice(0, 11).map((value) => {
      const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
      return { fileName: cleanText(input.fileName || "photo.jpg"), fileSize: Number(input.fileSize || 0), contentType: String(input.contentType || "").toLowerCase() } satisfies ImageRequest;
    });
    if (!files.length || files.length > 10) return Response.json({ error: "경기·훈련 사진은 한 번에 1장부터 10장까지 선택해 주세요." }, { status: 400 });
    if (files.some((item) => !allowedImageTypes.has(item.contentType) || !Number.isFinite(item.fileSize) || item.fileSize <= 0 || item.fileSize > maxImageBytes)) {
      return Response.json({ error: "사진은 JPG·PNG·WEBP 형식, 사진당 최대 12MB까지 등록할 수 있습니다." }, { status: 400 });
    }
    const entries = files.map((item, index) => {
      const submissionId = index === 0 ? id : randomUUID();
      const extension = safeImageExtension(item.fileName, item.contentType);
      return { submissionId, storageKey: `submissions/${submissionId}/photo.${extension}`, file: item };
    });
    const { error: insertError } = await db.from("player_profile_submissions").insert(entries.map((entry) => ({ ...base, id: entry.submissionId, profile_data: {}, original_name: entry.file.fileName, storage_key: entry.storageKey, content_type: entry.file.contentType, file_size: Math.round(entry.file.fileSize) })));
    if (insertError) return Response.json({ error: "사진 등록 요청을 만들지 못했습니다." }, { status: 500 });
    const signedTickets = await Promise.all(entries.map(async (entry) => ({ entry, result: await db.storage.from(bucket).createSignedUploadUrl(entry.storageKey) })));
    if (signedTickets.some(({ result }) => result.error || !result.data?.token)) {
      await db.from("player_profile_submissions").delete().in("id", entries.map((entry) => entry.submissionId));
      return Response.json({ error: "사진 업로드 주소를 만들지 못했습니다." }, { status: 500 });
    }
    const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
    const uploadEndpoint = `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable/sign`;
    const tickets = signedTickets.map(({ entry, result }) => ({ submissionId: entry.submissionId, storageKey: entry.storageKey, token: result.data!.token, uploadEndpoint }));
    const response = Response.json(Array.isArray(body.files) ? { submissionId: id, tickets } : { ...tickets[0], tickets }, { status: 201 });
    response.headers.append("Set-Cookie", `${visitorCookie}=${requester.visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const originalName = cleanText(body.fileName || "photo.jpg");
  const contentType = String(body.contentType || "").toLowerCase();
  const fileSize = Number(body.fileSize || 0);
  if (!allowedImageTypes.has(contentType) || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxImageBytes) {
    return Response.json({ error: "사진은 JPG·PNG·WEBP 형식, 최대 12MB까지 등록할 수 있습니다." }, { status: 400 });
  }
  const extension = safeImageExtension(originalName, contentType);
  const storageKey = `submissions/${id}/photo.${extension}`;
  const { error: insertError } = await db.from("player_profile_submissions").insert({ ...base, profile_data: {}, original_name: originalName, storage_key: storageKey, content_type: contentType, file_size: Math.round(fileSize) });
  if (insertError) return Response.json({ error: "사진 등록 요청을 만들지 못했습니다." }, { status: 500 });
  const { data: signed, error: signedError } = await db.storage.from(bucket).createSignedUploadUrl(storageKey);
  if (signedError || !signed?.token) {
    await db.from("player_profile_submissions").delete().eq("id", id);
    return Response.json({ error: "사진 업로드 주소를 만들지 못했습니다." }, { status: 500 });
  }
  const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  const response = Response.json({ submissionId: id, storageKey, token: signed.token, uploadEndpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable/sign` }, { status: 201 });
  response.headers.append("Set-Cookie", `${visitorCookie}=${requester.visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET() {
  const { role } = await apiAdmin();
  if (!role) return Response.json({ error: "운영자 권한이 필요합니다." }, { status: 403 });
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("player_profile_submissions").select("*").in("status", ["pending", "approved", "rejected"]).order("created_at", { ascending: false }).limit(40);
  if (error) return Response.json({ error: "사진·프로필 요청을 불러오지 못했습니다." }, { status: 500 });
  const rows = (data || []) as SubmissionRow[];
  const downloadable = rows.filter((row) => row.status !== "rejected" && row.storage_key);
  const signed = await Promise.all(downloadable.map(async (row) => ({ id: row.id, preview: (await db.storage.from(bucket).createSignedUrl(row.storage_key!, 20 * 60)).data?.signedUrl || "", download: (await db.storage.from(bucket).createSignedUrl(row.storage_key!, 20 * 60, { download: row.original_name || "amaon-photo" })).data?.signedUrl || "" })));
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
  const { data: row } = await db.from("player_profile_submissions").select("*").eq("id", id).eq("status", "pending").maybeSingle();
  if (!row) return Response.json({ error: "이미 처리되었거나 찾을 수 없는 요청입니다." }, { status: 409 });
  if (action === "reject") {
    const reason = cleanText(body.reason || "선수 관계 또는 등록 내용 확인 필요", 180);
    if (row.storage_key) await db.storage.from(bucket).remove([row.storage_key]);
    const { error } = await db.from("player_profile_submissions").update({ status: "rejected", review_reason: reason, reviewed_at: new Date().toISOString(), reviewed_by: user.email }).eq("id", id).eq("status", "pending");
    if (error) return Response.json({ error: "반려 처리를 저장하지 못했습니다." }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (row.submission_type === "profile") {
    const [{ data: roster }, { data: current }] = await Promise.all([
      db.from("roster_players").select("roster_year,jersey_number,grade,position,height,weight,bats_throws").eq("team_id", row.team_id).eq("player_id", row.player_id).maybeSingle(),
      db.from("player_profile_overrides").select("*").eq("team_id", row.team_id).eq("player_id", row.player_id).maybeSingle(),
    ]);
    if (!roster) return Response.json({ error: "반영할 선수 정보를 찾지 못했습니다." }, { status: 404 });
    const data = profilePayload(row.profile_data);
    const profileRow = {
      team_id: row.team_id, player_id: row.player_id,
      roster_year: data.year ?? current?.roster_year ?? roster.roster_year,
      jersey_number: data.number ?? current?.jersey_number ?? roster.jersey_number,
      grade: data.grade ?? current?.grade ?? roster.grade,
      position: data.position ?? current?.position ?? roster.position,
      height: data.height ?? current?.height ?? roster.height,
      weight: data.weight ?? current?.weight ?? roster.weight,
      introduction: data.introduction ?? current?.introduction ?? "",
      strengths: data.strengths ?? current?.strengths ?? "",
      aspiration: data.aspiration ?? current?.aspiration ?? "",
      updated_by: user.email,
    };
    const { error: profileError } = await db.from("player_profile_overrides").upsert(profileRow, { onConflict: "team_id,player_id" });
    if (profileError) return Response.json({ error: "선수 프로필에 수정 내용을 반영하지 못했습니다." }, { status: 500 });
    if (data.batsThrows) await db.from("roster_players").update({ bats_throws: data.batsThrows, updated_by: user.email }).eq("team_id", row.team_id).eq("player_id", row.player_id);
  } else {
    if (!row.storage_key) return Response.json({ error: "승인할 사진 파일을 찾지 못했습니다." }, { status: 409 });
    const category = row.submission_type === "profile_photo" ? "profile" : "photo";
    const extension = safeImageExtension(row.original_name, row.content_type);
    const finalKey = `teams/${row.team_id}/players/${row.player_id}/${category}/${Date.now()}-${id}.${extension}`;
    const { error: moveError } = await db.storage.from(bucket).move(row.storage_key, finalKey);
    if (moveError) return Response.json({ error: "승인 사진을 선수 보관함으로 옮기지 못했습니다." }, { status: 500 });
    const mediaPlayerId = `${row.team_id}--${row.player_id}`;
    const { error: mediaError } = await db.from("media_items").insert({ storage_key: finalKey, player_id: mediaPlayerId, category, content_type: row.content_type, uploaded_by: user.email });
    if (mediaError) {
      await db.storage.from(bucket).move(finalKey, row.storage_key);
      return Response.json({ error: "선수 프로필에 사진을 연결하지 못했습니다." }, { status: 500 });
    }
    row.storage_key = finalKey;
  }
  const { error: updateError } = await db.from("player_profile_submissions").update({ storage_key: row.storage_key, status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.email }).eq("id", id).eq("status", "pending");
  if (updateError) return Response.json({ error: "승인 상태를 저장하지 못했습니다." }, { status: 500 });
  return Response.json({ ok: true, profileUrl: `/?team=${encodeURIComponent(row.team_id)}&player=${encodeURIComponent(row.player_id)}#${encodeURIComponent(row.team_id)}` });
}
