import { createTeamAssetHandlers } from "../../team-asset-api";
const handlers = createTeamAssetHandlers("banner");
export const GET = handlers.GET;
export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
