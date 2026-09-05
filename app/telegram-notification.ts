type SubmissionNotification = {
  requestType: string;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendTelegramSubmissionNotification(notification: SubmissionNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    "<b>🔔 아마ON 새 승인 요청</b>",
    "",
    `<b>요청:</b> ${escapeHtml(notification.requestType)}`,
    `<b>접수:</b> ${new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date())}`,
    "",
    "상세 정보는 운영자 화면에서 확인해 주세요.",
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: "운영자 승인 화면 열기", url: "https://www.amaon.kr/#community" }]],
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error("Telegram notification request failed", response.status);
  } catch {
    console.error("Telegram notification request failed");
  }
}
