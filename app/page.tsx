import MemberHome from "./member-home";
import { requireAmaonUser } from "./auth";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function memberReturnTo(params: SearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((entry) => query.append(key, entry));
    else if (value) query.set(key, value);
  }
  const search = query.toString();
  return search ? `/?${search}` : "/";
}

async function SignedInHome({ returnTo }: { returnTo: string }) {
  await requireAmaonUser(returnTo);
  return <MemberHome />;
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return <SignedInHome returnTo={memberReturnTo(params)} />;
}
