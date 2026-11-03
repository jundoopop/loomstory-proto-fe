import { env } from "cloudflare:workers";
import { seedItems, stories, alternatives } from "../catalogue";
import {
  db,
  bucket,
  uid,
  now,
  one,
  all,
  run,
  Fault,
  check,
  text,
  hash,
  password,
  user,
  staff,
  limited,
  audit,
  owned,
  revision,
  json,
} from "./core";
import { validateImage } from "./media";
const cookie = (token: string, req: Request, age = 604800) =>
  `ve_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`;
const editable = (s: any) =>
  check(
    ["draft", "needs_more_information"].includes(s.state),
    "This submission is locked while it is being reviewed.",
    409,
  );
const fields = (b: any) => ({
  title: text(b.title) || "Untitled garment",
  brand: text(b.brand) || null,
  era: text(b.era) || "Unknown",
  size: text(b.size) || "Unknown",
  category: [
    "Jackets",
    "Coats",
    "Denim",
    "Tailoring",
    "Knitwear",
    "Dresses",
    "Other",
  ].includes(b.category)
    ? b.category
    : "Other",
  condition: text(b.condition) || "Unknown",
  notes: text(b.notes, 2000),
  consent: b.consent === true,
  missingLabel: b.missingLabel === true,
  price:
    Number.isInteger(b.price) && b.price >= 0 && b.price <= 1000000
      ? b.price
      : 15000,
  measurements: {
    chest: Number(b.measurements?.chest) || null,
    length: Number(b.measurements?.length) || null,
    shoulder: Number(b.measurements?.shoulder) || null,
  },
});
async function body(req: Request, max = 64000) {
  const b = await bounded(req, max);
  try {
    return JSON.parse(new TextDecoder().decode(b));
  } catch {
    throw new Fault(400, "Invalid request.");
  }
}
async function bounded(req: Request, max: number) {
  check(
    Number(req.headers.get("content-length") || 0) <= max,
    "File or request is too large.",
    413,
  );
  const r = req.body?.getReader();
  check(r, "A request body is required.");
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await r!.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await r!.cancel();
      throw new Fault(413, "File or request is too large.");
    }
    parts.push(value);
  }
  const out = new Uint8Array(size);
  let p = 0;
  for (const part of parts) {
    out.set(part, p);
    p += part.length;
  }
  return out;
}
async function bundle(s: any) {
  const media = await all(
    "SELECT id,mime,width,height,slot,fixture,public_permission FROM media WHERE submission_id=?",
    s.id,
  );
  const recognition = await one(
    "SELECT data,revision,created FROM recognition WHERE submission_id=? ORDER BY created DESC LIMIT 1",
    s.id,
  );
  const decisions = await all(
    "SELECT r.id,r.revision,r.decision,r.reason,r.created,u.name AS reviewer FROM reviews r JOIN users u ON u.id=r.reviewer_id WHERE r.submission_id=? ORDER BY r.created DESC",
    s.id,
  );
  const listing = await one(
    "SELECT id,state FROM listings WHERE submission_id=?",
    s.id,
  );
  return {
    ...s,
    data: JSON.parse(s.data),
    media,
    recognition: recognition
      ? { ...JSON.parse(recognition.data), revision: recognition.revision }
      : null,
    decisions,
    listing,
  };
}
async function currentListing(id: string) {
  const l = await one(
    "SELECT * FROM listings WHERE id=? AND state='published'",
    id,
  );
  check(l, "This page is not available. It may have been withdrawn.", 404);
  return l;
}
async function identify(s: any, u: any) {
  await limited("identify:" + u.id, 30);
  const media = await all(
    "SELECT id,fixture FROM media WHERE submission_id=?",
    s.id,
  );
  const fixtures = media.filter((m) => m.fixture);
  const isSample = media.length > 0 && fixtures.length === media.length;
  let outcome = "unknown";
  const fixture = fixtures[0]?.fixture;
  const runs = await one(
    "SELECT COUNT(*) AS n FROM recognition WHERE submission_id=?",
    s.id,
  );
  if (isSample) {
    outcome =
      fixture === "unknown"
        ? "unknown"
        : fixture === "label"
          ? "needs_more_information"
          : fixture === "failure" && runs.n === 0
            ? "failed"
            : "candidates";
  }
  const k = fixture === "trench" ? 1 : fixture === "denim" ? 2 : 0;
  const result = {
    mode: "sample",
    provider: "VintEdge prepared fixtures v1",
    catalogueVersion: "2026-11-03",
    execution: outcome === "failed" ? "failed" : "completed",
    outcome,
    assetIds: media.map((m) => m.id),
    durationMs: 1,
    observed: isSample
      ? [
          "Prepared front-view sample",
          "Silhouette and visible construction only",
        ]
      : ["User-supplied photographs; no live vision provider connected"],
    uncertain: [
      "Brand, manufacturing date and physical authenticity are not established",
    ],
    request:
      outcome === "needs_more_information"
        ? "Please add a readable label or construction-detail image. You may also declare that the label is missing."
        : null,
    message:
      outcome === "failed"
        ? "The prepared failure scenario interrupted recognition. Retry or continue with manual review."
        : outcome === "unknown"
          ? "No identification was made. A human reviewer can continue manually."
          : "Prepared demonstration only. Suggestions are not authentication.",
    candidates:
      outcome === "candidates"
        ? [
            {
              modelId: `model-${k}`,
              rank: 1,
              title: seedItems[k].title,
              image: k,
              label: "Possible visual match",
            },
            {
              modelId: `model-${(k + 3) % 6}`,
              rank: 2,
              title: seedItems[(k + 3) % 6].title,
              image: (k + 3) % 6,
              label: "Alternative to inspect",
            },
          ]
        : [],
  };
  await run(
    "INSERT INTO recognition(id,submission_id,revision,data,created) VALUES (?,?,?,?,?)",
    uid(),
    s.id,
    s.revision,
    JSON.stringify(result),
    now(),
  );
  await audit(
    u.id,
    outcome === "failed" ? "recognition_failed" : "recognition_completed",
    s.id,
  );
  return result;
}
async function setup(req: Request) {
  const secret = (env as any).SETUP_SECRET;
  check(
    secret && req.headers.get("x-setup-secret") === secret,
    "Not found.",
    404,
  );
  const b = await body(req);
  check(
    !(await one("SELECT id FROM users LIMIT 1")),
    "This environment has already been initialized.",
    409,
  );
  check(
    Array.isArray(b.accounts) && b.accounts.length === 3,
    "Three demo accounts are required.",
  );
  const statements = [];
  for (const [i, a] of b.accounts.entries()) {
    check(
      typeof a.password === "string" && a.password.length >= 12,
      "Use a strong demo password.",
    );
    statements.push(
      db()
        .prepare(
          "INSERT INTO users(id,email,name,password,role) VALUES (?,?,?,?,?)",
        )
        .bind(
          `demo-${i}`,
          a.email,
          a.name,
          await password(a.password),
          i === 2 ? "operator" : "member",
        ),
    );
  }
  for (let k = 0; k < 6; k++)
    statements.push(
      db()
        .prepare("INSERT INTO models(id,data) VALUES (?,?)")
        .bind(
          `model-${k}`,
          JSON.stringify({
            title: seedItems[k].title,
            category: seedItems[k].category,
            fictional: true,
          }),
        ),
    );
  for (const item of seedItems) {
    statements.push(
      db()
        .prepare(
          "INSERT INTO items(id,owner_id,model_id,authenticity,custody) VALUES (?,?,?,?,?)",
        )
        .bind(
          item.itemId,
          "demo-2",
          item.modelId,
          "not_assessed",
          "not_received",
        ),
    );
    statements.push(
      db()
        .prepare(
          "INSERT INTO listings(id,item_id,state,revision,data) VALUES (?,?,?,?,?)",
        )
        .bind(item.id, item.itemId, "published", 1, JSON.stringify(item)),
    );
  }
  await db().batch(statements);
  await audit("demo-2", "demo_seed", "catalogue");
  return json({ ok: true, count: 18 });
}
export async function api(req: Request) {
  try {
    const url = new URL(req.url),
      parts = url.pathname
        .replace(/^\/api\/?/, "")
        .split("/")
        .filter(Boolean),
      [resource, id, action] = parts,
      method = req.method;
    if (!["GET", "HEAD"].includes(method)) {
      const origin = req.headers.get("origin");
      check(
        !origin || origin === url.origin,
        "This request came from a different site.",
        403,
      );
      check(
        req.headers.get("sec-fetch-site") !== "cross-site",
        "Cross-site writes are not allowed.",
        403,
      );
    }
    if (resource === "setup" && method === "POST") return await setup(req);
    if (resource === "health")
      return json({ ok: true, service: "VintEdge", mode: "demo" });
    if (resource === "auth") {
      if (id === "me") return json({ user: await user(req) });
      if (id === "logout" && method === "POST") {
        const token = req.headers
          .get("cookie")
          ?.match(/(?:^|; )ve_session=([^;]+)/)?.[1];
        if (token)
          await run("DELETE FROM sessions WHERE id=?", await hash(token));
        return json({ ok: true }, 200, { "Set-Cookie": cookie("", req, 0) });
      }
      if (method === "POST" && ["login", "register"].includes(id)) {
        await limited(
          "login-ip:" + (req.headers.get("cf-connecting-ip") || "local"),
          60,
        );
        const b = await body(req),
          email = text(b.email).toLowerCase();
        check(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), "Enter a valid email.");
        check(
          typeof b.password === "string" &&
            b.password.length >= 12 &&
            b.password.length <= 128,
          "Use a password between 12 and 128 characters.",
        );
        await limited("login:" + email, 15, 15);
        let u = await one("SELECT * FROM users WHERE email=?", email);
        if (id === "register") {
          check(!u, "That account already exists. Sign in instead.", 409);
          check(text(b.name), "Enter a display name.");
          await limited(
            "register:" + (req.headers.get("cf-connecting-ip") || "local"),
            10,
          );
          u = {
            id: uid(),
            email,
            name: text(b.name, 60),
            role: "member",
            password: await password(b.password),
          };
          await run(
            "INSERT INTO users(id,email,name,password,role) VALUES (?,?,?,?,?)",
            u.id,
            email,
            u.name,
            u.password,
            "member",
          );
        } else {
          const salt = u?.password.split(":")[0] || "invalid-account";
          const computed = await password(b.password, salt);
          check(
            u && u.password === computed,
            "Email or password is incorrect.",
            401,
          );
        }
        const token = uid() + uid();
        await run(
          "INSERT INTO sessions(id,user_id,expires) VALUES (?,?,?)",
          await hash(token),
          u.id,
          Date.now() + 604800000,
        );
        return json(
          { user: { id: u.id, email: u.email, name: u.name, role: u.role } },
          200,
          { "Set-Cookie": cookie(token, req) },
        );
      }
    }
    if (resource === "catalog" && method === "GET") {
      const q = text(url.searchParams.get("q")).toLowerCase(),
        category = text(url.searchParams.get("category")),
        era = text(url.searchParams.get("era")),
        collection = text(url.searchParams.get("collection"));
      const max = Number(url.searchParams.get("max") || 1000000);
      check(Number.isFinite(max) && max >= 0, "Invalid price filter.");
      let items = (
        await all(
          "SELECT data FROM listings WHERE state='published' ORDER BY id",
        )
      ).map((x) => JSON.parse(x.data));
      items = items.filter(
        (x) =>
          (!q ||
            [
              x.title,
              x.brand,
              x.era,
              x.category,
              stories.find((s) => s.id === x.storyId)?.tags.join(" "),
            ]
              .join(" ")
              .toLowerCase()
              .includes(q)) &&
          (!category || x.category === category) &&
          (!era || x.era === era) &&
          (!collection || x.collection === collection) &&
          x.price <= max,
      );
      const total = items.length;
      const offset = Math.max(
          0,
          Math.min(10000, parseInt(url.searchParams.get("offset") || "0") || 0),
        ),
        limit = Math.max(
          1,
          Math.min(60, parseInt(url.searchParams.get("limit") || "24") || 24),
        );
      return json({ items: items.slice(offset, offset + limit), total });
    }
    if (resource === "stories" && method === "GET") return json({ stories });
    if (resource === "alternatives" && method === "GET")
      return json({ alternatives });
    if (resource === "listings" && method === "GET") {
      const l = await currentListing(id);
      const u = await user(req);
      return json({
        ...JSON.parse(l.data),
        interested: u
          ? !!(await one(
              "SELECT id FROM interests WHERE member_id=? AND listing_id=?",
              u.id,
              id,
            ))
          : false,
      });
    }
    if (resource === "public-media" && method === "GET") {
      const m = await one(
        "SELECT m.* FROM media m JOIN listings l ON l.submission_id=m.submission_id WHERE m.id=? AND m.public_permission=1 AND l.state='published' AND EXISTS (SELECT 1 FROM json_each(l.data,'$.publicMedia') j WHERE j.value=m.id)",
        id,
      );
      check(m?.derivative_key, "Image not found.", 404);
      const object = await bucket().get(m.derivative_key);
      check(object, "Image not found.", 404);
      return new Response(object!.body, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (resource === "events" && method === "POST") {
      const b = await body(req);
      check(
        ["catalogue_view", "detail_view", "alternative_click"].includes(
          b.action,
        ),
        "Invalid event.",
      );
      await limited(
        "event:" + (req.headers.get("cf-connecting-ip") || "local"),
        300,
      );
      const u = await user(req);
      await audit(u?.id || null, b.action, text(b.target, 100));
      return json({ ok: true });
    }
    const u = await user(req, true);
    if (resource === "media" && method === "GET") {
      const m = await one("SELECT * FROM media WHERE id=?", id);
      check(m, "Image not found.", 404);
      await owned(m.submission_id, u, true);
      check(
        m.object_key,
        "This is a named prepared sample; no private original exists.",
        404,
      );
      const object = await bucket().get(m.object_key);
      check(object, "Image not found.", 404);
      return new Response(object!.body, {
        headers: {
          "Content-Type": m.mime,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (resource === "submissions") {
      if (method === "GET") {
        if (id) return json(await bundle(await owned(id, u)));
        return json({
          submissions: await Promise.all(
            (
              await all(
                "SELECT * FROM submissions WHERE owner_id=? ORDER BY created DESC LIMIT 100",
                u.id,
              )
            ).map(bundle),
          ),
        });
      }
      if (!id && method === "POST") {
        await limited("draft:" + u.id, 50);
        const b = await body(req);
        check(
          /^[0-9a-f-]{36}$/.test(b.id),
          "A valid request identifier is required.",
        );
        const existing = await one(
          "SELECT * FROM submissions WHERE id=?",
          b.id,
        );
        if (existing) {
          check(existing.owner_id === u.id, "Submission not found.", 404);
          return json(await bundle(existing));
        }
        const itemId = uid();
        await db().batch([
          db()
            .prepare(
              "INSERT INTO items(id,owner_id,authenticity,custody) VALUES (?,?,?,?)",
            )
            .bind(itemId, u.id, "not_assessed", "not_received"),
          db()
            .prepare(
              "INSERT INTO submissions(id,owner_id,item_id,state,revision,data,created,updated) VALUES (?,?,?,?,?,?,?,?)",
            )
            .bind(
              b.id,
              u.id,
              itemId,
              "draft",
              1,
              JSON.stringify(fields(b)),
              now(),
              now(),
            ),
        ]);
        return json(await bundle(await owned(b.id, u)), 201);
      }
      const s = await owned(id, u);
      const data = JSON.parse(s.data);
      if (action === "uploads" && method === "POST") {
        editable(s);
        const rev = Number(req.headers.get("x-revision"));
        revision(s, rev);
        check(
          req.headers.get("x-rights") === "confirmed",
          "Confirm permission to use these photographs.",
        );
        await limited("upload:" + u.id, 30);
        const images = await one(
          "SELECT COUNT(*) AS n FROM media WHERE submission_id=?",
          id,
        );
        check(images.n < 5, "You can attach up to five images.");
        const bytes = await bounded(req, 8 * 1024 * 1024);
        let validated;
        try {
          validated = validateImage(bytes);
        } catch (e) {
          await audit(u.id, "upload_failed", id);
          throw e;
        }
        const assetId = uid(),
          key = `private/${u.id}/${assetId}`,
          derivative = `derivatives/${assetId}`;
        await bucket().put(key, bytes);
        await bucket().put(derivative, validated.derivative);
        const slot = ["front", "back", "detail"].includes(
          req.headers.get("x-slot") || "",
        )
          ? req.headers.get("x-slot")
          : "detail";
        const result = await db().batch([
          db()
            .prepare(
              "INSERT INTO media(id,owner_id,submission_id,object_key,derivative_key,mime,width,height,slot,rights,public_permission) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND revision=? AND state IN (?,?)) AND (SELECT COUNT(*) FROM media WHERE submission_id=?)<5",
            )
            .bind(
              assetId,
              u.id,
              id,
              key,
              derivative,
              validated.mime,
              validated.width,
              validated.height,
              slot,
              "Owner declared permission",
              req.headers.get("x-publish-permission") === "yes" ? 1 : 0,
              id,
              rev,
              "draft",
              "needs_more_information",
              id,
            ),
          db()
            .prepare(
              "UPDATE submissions SET revision=revision+1,reviewed_revision=NULL,updated=? WHERE id=? AND revision=? AND EXISTS(SELECT 1 FROM media WHERE id=?)",
            )
            .bind(now(), id, rev, assetId),
        ]);
        if (!result[0].meta.changes) {
          await bucket().delete([key, derivative]);
          throw new Fault(
            409,
            "The submission changed or already has five images. Refresh and try again.",
          );
        }
        return json(await bundle(await owned(id, u)));
      }
      if (action === "sample" && method === "POST") {
        editable(s);
        const b = await body(req);
        revision(s, b.revision);
        check(
          [
            "leather",
            "trench",
            "denim",
            "label",
            "unknown",
            "failure",
          ].includes(b.sample),
          "Choose a named sample.",
        );
        const old = await one(
          "SELECT COUNT(*) AS n FROM media WHERE submission_id=?",
          id,
        );
        check(old.n === 0, "A prepared sample must start with an empty draft.");
        const assetId = uid();
        await db().batch([
          db()
            .prepare(
              "INSERT INTO media(id,owner_id,submission_id,mime,width,height,slot,fixture,rights,public_permission) SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND revision=?) AND NOT EXISTS(SELECT 1 FROM media WHERE submission_id=?)",
            )
            .bind(
              assetId,
              u.id,
              id,
              "image/png",
              512,
              512,
              "front",
              b.sample,
              "AI-generated fictional sample",
              1,
              id,
              b.revision,
              id,
            ),
          db()
            .prepare(
              "UPDATE submissions SET revision=revision+1,updated=? WHERE id=? AND revision=? AND EXISTS(SELECT 1 FROM media WHERE id=?)",
            )
            .bind(now(), id, b.revision, assetId),
        ]);
        return json(await bundle(await owned(id, u)));
      }
      if (!action && method === "PATCH") {
        editable(s);
        const b = await body(req);
        revision(s, b.revision);
        const changed = await run(
          "UPDATE submissions SET data=?,revision=revision+1,reviewed_revision=NULL,updated=? WHERE id=? AND revision=?",
          JSON.stringify(fields(b)),
          now(),
          id,
          b.revision,
        );
        check(
          changed.meta.changes,
          "The draft changed. Refresh and retry.",
          409,
        );
        return json(await bundle(await owned(id, u)));
      }
      if (action === "submit" && method === "POST") {
        const b = await body(req);
        if (["submitted", "under_review", "accepted"].includes(s.state))
          return json(await bundle(s));
        revision(s, b.revision);
        editable(s);
        check(
          data.consent,
          "Confirm you have permission to submit the photographs.",
        );
        check(
          data.title && data.title !== "Untitled garment",
          "Add a descriptive title.",
        );
        check(
          await one(
            "SELECT id FROM media WHERE submission_id=? AND slot=?",
            id,
            "front",
          ),
          "Add a front photograph or choose a prepared sample.",
        );
        const r = await run(
          "UPDATE submissions SET state='under_review',updated=? WHERE id=? AND revision=? AND state IN ('draft','needs_more_information')",
          now(),
          id,
          b.revision,
        );
        check(r.meta.changes, "Submission changed. Refresh and retry.", 409);
        await audit(u.id, "submission_completed", id);
        await identify(s, u);
        return json(await bundle(await owned(id, u)));
      }
      if (action === "identify" && method === "POST") {
        check(
          ["under_review", "submitted", "needs_more_information"].includes(
            s.state,
          ),
          "Submit this draft before requesting identification.",
        );
        return json(await identify(s, u));
      }
    }
    if (resource === "review") {
      staff(u);
      if (method === "GET") {
        if (id) return json(await bundle(await owned(id, u, true)));
        return json({
          submissions: await Promise.all(
            (
              await all(
                "SELECT * FROM submissions WHERE state!='draft' ORDER BY updated DESC LIMIT 100",
              )
            ).map(bundle),
          ),
          reports: await all(
            "SELECT * FROM reports ORDER BY created DESC LIMIT 100",
          ),
          events: await all(
            "SELECT action,COUNT(*) AS count FROM events GROUP BY action",
          ),
        });
      }
      const s = await owned(id, u, true),
        b = await body(req);
      revision(s, b.revision);
      if (action === "identify") {
        return json(await identify(s, u));
      }
      if (action === "decision") {
        check(
          [
            "under_review",
            "submitted",
            "needs_more_information",
            "rejected",
          ].includes(s.state),
          "This revision has already been reviewed.",
          409,
        );
        check(
          ["accepted", "needs_more_information", "rejected"].includes(
            b.decision,
          ),
          "Choose a review decision.",
        );
        check(
          text(b.reason, 2000).length >= 12,
          "Add a meaningful review reason (at least 12 characters).",
        );
        const data = JSON.parse(s.data);
        let sources: any[] = [],
          claim: any = null;
        const modelId = b.modelId || null;
        check(
          !modelId || (await one("SELECT id FROM models WHERE id=?", modelId)),
          "Unknown garment model.",
        );
        if (b.decision === "accepted") {
          check(text(b.title), "Add a public title.");
          check(
            Number.isInteger(b.price) && b.price >= 0 && b.price <= 1000000,
            "Enter a valid price in integer cents.",
          );
          check(
            [
              "context_only",
              "resemblance",
              "same_model",
              "unresolved",
            ].includes(b.claimType),
            "Choose the scope of the association.",
          );
          if (b.claimType !== "unresolved") {
            check(
              text(b.assertion, 2000).length >= 12,
              "Write the precise assertion you reviewed.",
            );
            sources = Array.isArray(b.sources)
              ? b.sources.slice(0, 5).map((source: any) => {
                  let parsed;
                  try {
                    parsed = new URL(source.url);
                  } catch {}
                  check(
                    parsed &&
                      parsed.protocol === "https:" &&
                      !parsed.username &&
                      !parsed.password,
                    "Evidence needs an HTTPS source link.",
                  );
                  check(
                    text(source.title) &&
                      text(source.locator, 1000).length >= 8,
                    "Include a source title and a locator or explanation of the supporting passage.",
                  );
                  return {
                    url: parsed!.href,
                    title: text(source.title),
                    publisher: text(source.publisher),
                    locator: text(source.locator, 1000),
                    accessed: now().slice(0, 10),
                  };
                })
              : [];
            check(
              sources.length,
              "A factual cultural assertion needs supporting evidence.",
            );
          }
          claim = {
            type: b.claimType,
            status:
              b.claimType === "unresolved" ? "needs_evidence" : "approved",
            assertion: text(b.assertion, 2000),
            sources,
            reason: text(b.publicRationale, 2000),
          };
          check(
            b.claimType === "unresolved" || claim.reason.length >= 12,
            "Write a public explanation of the evidence and its limits.",
          );
          check(
            b.claimType !== "same_model" || modelId,
            "A same-model claim requires a selected garment model.",
          );
        }
        const rev = s.revision + 1,
          reviewId = uid(),
          newData = {
            ...data,
            title: b.decision === "accepted" ? text(b.title) : data.title,
            price: b.decision === "accepted" ? b.price : data.price,
            era: text(b.era) || data.era,
            modelId,
            claim,
          };
        const changes = await db().batch([
          db()
            .prepare(
              "UPDATE submissions SET state=?,revision=?,reviewed_revision=?,data=?,updated=? WHERE id=? AND revision=?",
            )
            .bind(
              b.decision,
              rev,
              b.decision === "accepted" ? rev : null,
              JSON.stringify(newData),
              now(),
              id,
              b.revision,
            ),
          db()
            .prepare(
              "INSERT INTO reviews(id,submission_id,revision,reviewer_id,decision,reason,data,created) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND revision=? AND state=?) AND NOT EXISTS(SELECT 1 FROM reviews WHERE submission_id=? AND revision=?)",
            )
            .bind(
              reviewId,
              id,
              rev,
              u.id,
              b.decision,
              text(b.reason, 2000),
              JSON.stringify({
                sources,
                targetRevision: b.revision,
                modelId,
                claim,
              }),
              now(),
              id,
              rev,
              b.decision,
              id,
              rev,
            ),
        ]);
        check(
          changes[0].meta.changes,
          "A newer review exists. Refresh and try again.",
          409,
        );
        if (b.decision === "accepted")
          await run(
            "UPDATE items SET model_id=? WHERE id=?",
            modelId,
            s.item_id,
          );
        if (claim)
          await run(
            "INSERT INTO claims(id,submission_id,revision,state,data) VALUES (?,?,?,?,?)",
            uid(),
            id,
            rev,
            claim.status,
            JSON.stringify(claim),
          );
        await audit(u.id, "review_completed", id);
        return json(await bundle(await owned(id, u, true)));
      }
      if (action === "publish") {
        staff(u, "operator");
        check(
          s.state === "accepted" && s.reviewed_revision === s.revision,
          "Publication requires approval of the current revision.",
          409,
        );
        check(
          await one(
            "SELECT id FROM reviews WHERE submission_id=? AND revision=? AND decision=?",
            id,
            s.revision,
            "accepted",
          ),
          "The current review record is missing.",
          409,
        );
        const d = JSON.parse(s.data),
          media = await all(
            "SELECT id,fixture,public_permission FROM media WHERE submission_id=?",
            id,
          );
        check(
          media.some((m) => m.public_permission),
          "No image has permission for public display.",
        );
        const publicMedia = media
            .filter((m) => m.public_permission && !m.fixture)
            .map((m) => m.id),
          fixture = media.find((m) => m.fixture)?.fixture,
          k = fixture === "trench" ? 1 : fixture === "denim" ? 2 : 0;
        const listingId = `listing-${id}`,
          story = stories.find((x) => x.id === b.storyId) || stories[k];
        check(
          !d.claim || d.claim.type === "unresolved" || d.claim.sources.length,
          "Cultural evidence is missing.",
        );
        const projection = {
          id: listingId,
          itemId: s.item_id,
          modelId: d.modelId,
          title: d.title,
          brand: d.brand || "Unknown",
          era: d.era,
          year: "Exact year unknown",
          category: d.category,
          size: d.size,
          condition: d.condition,
          conditionNotes:
            "Condition is contributor-reported; the physical garment has not been inspected.",
          price: d.price,
          currency: "EUR",
          measurements: d.measurements,
          description:
            "A community submission with a recorded human editorial review.",
          image: fixture ? k : null,
          publicMedia,
          storyId: story.id,
          collection: story.collection,
          isDemo: true,
          fictional: !!fixture,
          identity: d.modelId ? "reviewed" : "unresolved",
          authenticity: "not_assessed",
          provenance: "not_established",
          claim: d.claim,
          mediaRights: fixture
            ? "AI-generated prepared sample."
            : "Contributor granted publication permission; metadata-stripped derivative only.",
        };
        const r = await run(
          "INSERT INTO listings(id,item_id,submission_id,state,revision,data) SELECT ?,?,?,'published',?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND revision=? AND reviewed_revision=? AND state='accepted') ON CONFLICT(item_id) DO UPDATE SET state='published',revision=excluded.revision,data=excluded.data",
          listingId,
          s.item_id,
          id,
          s.revision,
          JSON.stringify(projection),
          id,
          s.revision,
          s.revision,
        );
        check(
          r.meta.changes,
          "The approved revision changed. Refresh and retry.",
          409,
        );
        await audit(u.id, "publication", listingId);
        return json({ id: listingId });
      }
    }
    if (resource === "listings" && action === "interest" && method === "POST") {
      await currentListing(id);
      const interestResult = await run(
        "INSERT INTO interests(id,member_id,listing_id,created) VALUES (?,?,?,?) ON CONFLICT(member_id,listing_id) DO NOTHING",
        uid(),
        u.id,
        id,
        now(),
      );
      if (interestResult.meta.changes) await audit(u.id, "interest", id);
      return json({
        interested: true,
        message:
          "Interest registered. No payment was taken, and no item is reserved or purchased.",
      });
    }
    if (resource === "listings" && action === "withdraw" && method === "POST") {
      staff(u, "operator");
      const l = await currentListing(id),
        b = await body(req);
      check(
        text(b.reason, 2000).length >= 12,
        "Explain why this page is being withdrawn.",
      );
      const statements = [
        db()
          .prepare("UPDATE listings SET state='unpublished' WHERE id=?")
          .bind(id),
        db()
          .prepare(
            "UPDATE reports SET state='resolved_withdrawn' WHERE listing_id=?",
          )
          .bind(id),
      ];
      if (l.submission_id) {
        statements.push(
          db()
            .prepare(
              "UPDATE submissions SET state='under_review',revision=revision+1,reviewed_revision=NULL,updated=? WHERE id=?",
            )
            .bind(now(), l.submission_id),
          db()
            .prepare(
              "UPDATE claims SET state='withdrawn' WHERE submission_id=?",
            )
            .bind(l.submission_id),
          db()
            .prepare(
              "INSERT INTO reviews(id,submission_id,revision,reviewer_id,decision,reason,data,created) VALUES (?,?,?,?,?,?,?,?)",
            )
            .bind(
              uid(),
              l.submission_id,
              l.revision,
              u.id,
              "withdrawn",
              text(b.reason, 2000),
              "{}",
              now(),
            ),
        );
      } else {
        statements.push(
          db()
            .prepare(
              "INSERT INTO reviews(id,submission_id,revision,reviewer_id,decision,reason,data,created) VALUES (?,?,?,?,?,?,?,?)",
            )
            .bind(
              uid(),
              `seed:${id}`,
              l.revision,
              u.id,
              "withdrawn",
              text(b.reason, 2000),
              "{}",
              now(),
            ),
        );
      }
      await db().batch(statements);
      await audit(u.id, "withdrawal", id);
      return json({ ok: true });
    }
    if (resource === "reports" && method === "POST") {
      const b = await body(req);
      await currentListing(b.listingId);
      check(
        text(b.reason, 2000).length >= 12,
        "Describe the concern in at least 12 characters.",
      );
      await limited("report:" + u.id, 20);
      await run(
        "INSERT INTO reports(id,member_id,listing_id,reason,state,created) VALUES (?,?,?,?,?,?)",
        uid(),
        u.id,
        b.listingId,
        text(b.reason, 2000),
        "open",
        now(),
      );
      await audit(u.id, "report_created", b.listingId);
      return json({
        message: "Thank you. Your concern is in the editorial review queue.",
      });
    }
    throw new Fault(404, "That action or page does not exist.");
  } catch (e: any) {
    if (e instanceof Fault) return json({ error: e.message }, e.status);
    console.error("api_error", e?.name, e?.message?.slice(0, 120));
    return json(
      { error: "Something went wrong. Your saved work is safe; please retry." },
      500,
    );
  }
}
