import { env } from "cloudflare:workers";
export const db = () => env.DB!;
export const bucket = () => env.BUCKET!;
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const one = async (sql: string, ...args: any[]) =>
  db()
    .prepare(sql)
    .bind(...args)
    .first<any>();
export const all = async (sql: string, ...args: any[]) =>
  (
    await db()
      .prepare(sql)
      .bind(...args)
      .all<any>()
  ).results;
export const run = async (sql: string, ...args: any[]) =>
  db()
    .prepare(sql)
    .bind(...args)
    .run();
export class Fault extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const check = (ok: any, message: string, status = 400) => {
  if (!ok) throw new Fault(status, message);
};
export const text = (v: any, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export const hash = async (v: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)),
    ),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
export async function password(value: string, salt = uid()) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(value),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
    },
    key,
    256,
  );
  return (
    salt +
    ":" +
    Array.from(new Uint8Array(bits))
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}
export async function user(req: Request, required = false) {
  const token = req.headers
    .get("cookie")
    ?.match(/(?:^|; )ve_session=([^;]+)/)?.[1];
  const u = token
    ? await one(
        "SELECT u.id,u.email,u.name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires>?",
        await hash(token),
        Date.now(),
      )
    : null;
  if (required) check(u, "Please sign in to continue.", 401);
  return u;
}
export function staff(u: any, role = "reviewer") {
  check(
    u && (u.role === "operator" || u.role === role),
    "This action requires an authorized staff account.",
    403,
  );
}
export async function limited(key: string, limit = 30, minutes = 60) {
  const id = await hash(key + ":" + Math.floor(Date.now() / (minutes * 60000)));
  const r = await db()
    .prepare(
      "INSERT INTO rate_limits (id,count,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(id, Date.now() + minutes * 60000)
    .first<any>();
  check(r.count <= limit, "Too many attempts. Please try again later.", 429);
}
export const audit = async (
  actor: string | null,
  action: string,
  target: string,
) =>
  run(
    "INSERT INTO events (id,actor_id,action,target,mode,created) VALUES (?,?,?,?,?,?)",
    uid(),
    actor,
    action,
    target,
    "demo",
    now(),
  );
export async function owned(id: string, u: any, allowStaff = false) {
  const s = await one("SELECT * FROM submissions WHERE id=?", id);
  check(
    s &&
      (s.owner_id === u.id ||
        (allowStaff && ["reviewer", "operator"].includes(u.role))),
    "Submission not found.",
    404,
  );
  return s;
}
export function revision(s: any, v: any) {
  check(
    Number.isInteger(v) && s.revision === v,
    "This record changed. Refresh it before trying again.",
    409,
  );
}
export const json = (v: any, status = 200, extra: any = {}) =>
  Response.json(v, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
