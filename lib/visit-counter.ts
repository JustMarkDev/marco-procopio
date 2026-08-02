const counterKey = "portfolio:page-views";
const dedupeSeconds = 60 * 60 * 24;

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Page view counter requires KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN",
    );
  }

  return { url, token };
}

async function runRedisCommand<T>(command: Array<string | number>) {
  const { url, token } = getRedisConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Page view store returned ${response.status}`);

  const payload = (await response.json()) as RedisResponse<T>;
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}

export async function recordPageView(visitId: string) {
  const script = `
    if redis.call("SET", KEYS[2], "1", "NX", "EX", ARGV[1]) then
      return redis.call("INCR", KEYS[1])
    end
    return tonumber(redis.call("GET", KEYS[1]) or "0")
  `;

  const count = await runRedisCommand<number>([
    "EVAL",
    script,
    2,
    counterKey,
    `${counterKey}:visit:${visitId}`,
    dedupeSeconds,
  ]);

  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
    throw new Error("Page view store returned an invalid count");
  }

  return count;
}
