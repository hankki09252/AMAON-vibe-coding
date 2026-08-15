export const dynamic = "force-dynamic";

export function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_URL ||
    "development";

  return Response.json(
    { version },
    {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    },
  );
}
