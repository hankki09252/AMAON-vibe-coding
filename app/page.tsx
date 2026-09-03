import MemberHome from "./member-home";
import { getAmaonUser } from "./auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getAmaonUser();
  return <MemberHome signedIn={Boolean(user)} />;
}
