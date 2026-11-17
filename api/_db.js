// Upstash Redis over its REST API (no dependency). Files starting with _ are not public routes.
// Environment: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL and KV_REST_API_TOKEN).
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const HASH = "lid:sessions:v1";
export const hasDb = () => Boolean(URL_ && TOKEN);

export async function redis(...command) {
  const res = await fetch(URL_, { method: "POST", headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(command) });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return (await res.json()).result;
}
