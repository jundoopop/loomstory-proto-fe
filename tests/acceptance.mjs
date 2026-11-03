import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
const origin = process.env.TEST_ORIGIN || "http://localhost:5173";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(origin).hostname),
  "Acceptance tests are restricted to the local demo environment.",
);
const { accounts } = JSON.parse(fs.readFileSync(".demo-accounts.json", "utf8"));
let passed = 0;
const ok = (message) => {
  passed++;
  console.log(`✓ ${message}`);
};
async function call(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const r = await fetch(origin + "/api" + path, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body && !(body instanceof Uint8Array)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body: body
      ? body instanceof Uint8Array
        ? body
        : JSON.stringify(body)
      : undefined,
  });
  const data = r.headers.get("content-type")?.includes("application/json")
    ? await r.json()
    : new Uint8Array(await r.arrayBuffer());
  return {
    status: r.status,
    data,
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
const member = await call("/auth/login", { method: "POST", body: accounts[0] });
assert.equal(member.status, 200);
const a = member.cookie;
const buyer = await call("/auth/login", { method: "POST", body: accounts[1] });
assert.equal(buyer.status, 200);
const b = buyer.cookie;
const editor = await call("/auth/login", { method: "POST", body: accounts[2] });
assert.equal(editor.status, 200);
const staff = editor.cookie;
ok("Three distinct authenticated accounts; staff role is server assigned");
const init = await call("/catalog");
assert.equal(init.status, 200);
assert(init.data.items.length >= 18);
assert(
  init.data.items.every((x) => x.isDemo && x.authenticity === "not_assessed"),
);
ok(
  "Public catalogue exposes only explicit demo listings and separate trust states",
);
const filter = await call(
  "/catalog?q=leather&category=Jackets&era=1980s&max=19000",
);
assert(
  filter.data.items.every(
    (x) => x.category === "Jackets" && x.era === "1980s" && x.price <= 19000,
  ),
);
assert(filter.data.items.length > 0);
assert.equal((await call("/catalog?q=impossible-text-zzq")).data.total, 0);
ok("Composed search/category/decade/price filters and empty results");
async function draft(title = "Acceptance test garment") {
  const r = await call("/submissions", {
    method: "POST",
    cookie: a,
    body: {
      id: crypto.randomUUID(),
      title,
      consent: true,
      missingLabel: true,
      category: "Jackets",
      era: "1980s",
      size: "M",
      price: 15000,
      notes: "Private notes must not enter the public projection.",
    },
  });
  assert.equal(r.status, 201);
  return r.data;
}
let s = await draft();
const sid = s.id;
const duplicate = await call("/submissions", {
  method: "POST",
  cookie: a,
  body: { id: sid, title: "Do not overwrite" },
});
assert.equal(duplicate.data.data.title, s.data.title);
ok("Draft creation is persistent and retry-safe");
assert.equal((await call("/submissions/" + sid)).status, 401);
assert.equal((await call("/submissions/" + sid, { cookie: b })).status, 404);
assert.equal(
  (
    await call("/submissions/" + sid, {
      method: "PATCH",
      cookie: b,
      body: { revision: 1, title: "attack" },
    })
  ).status,
  404,
);
assert.equal((await call("/review", { cookie: b })).status, 403);
assert.equal(
  (
    await call("/review/" + sid + "/decision", {
      method: "POST",
      cookie: b,
      body: { revision: 1, role: "operator", decision: "accepted" },
    })
  ).status,
  403,
);
assert.equal(
  (
    await call("/review/" + sid + "/publish", {
      method: "POST",
      cookie: b,
      body: { revision: 1 },
    })
  ).status,
  403,
);
ok(
  "Direct ownership checks reject another member; client role tampering cannot review or publish",
);
assert.equal(
  (
    await call("/submissions/" + sid + "/submit", {
      method: "POST",
      cookie: a,
      body: { revision: 1 },
    })
  ).status,
  400,
);
ok("Missing front media blocks submission");
s = (
  await call("/submissions/" + sid + "/sample", {
    method: "POST",
    cookie: a,
    body: { revision: s.revision, sample: "leather" },
  })
).data;
assert.equal(
  (
    await call("/submissions/" + sid, {
      method: "PATCH",
      cookie: a,
      body: { revision: 1, title: "stale" },
    })
  ).status,
  409,
);
ok("Stale draft updates fail with a conflict");
s = (
  await call("/submissions/" + sid + "/submit", {
    method: "POST",
    cookie: a,
    body: { revision: s.revision },
  })
).data;
assert.equal(s.state, "under_review");
assert.equal(s.recognition.mode, "sample");
assert.equal(s.recognition.outcome, "candidates");
assert.equal(s.recognition.candidates[0].label, "Possible visual match");
assert.equal(
  (await call("/submissions/" + sid, { cookie: a })).data.state,
  "under_review",
);
ok(
  "Prepared recognition is labelled, ranked, persistent and non-authenticating",
);
assert.equal(
  (
    await call("/review/" + sid + "/publish", {
      method: "POST",
      cookie: staff,
      body: { revision: s.revision },
    })
  ).status,
  409,
);
ok("Unreviewed content cannot be published");
const review = {
  revision: s.revision,
  decision: "accepted",
  modelId: "model-0",
  title: "Acceptance leather study",
  era: "1980s",
  price: 15000,
  claimType: "context_only",
  assertion:
    "This is general historical context, not an identification of the physical garment.",
  reason:
    "Inspected the named fictional sample and the scope of the supporting museum reference.",
  publicRationale:
    "The reference supports historical context only, and makes no item-specific provenance claim.",
  sources: [
    {
      url: "https://www.parismuseescollections.paris.fr/en/node/951903",
      title: "Palais Galliera blouson",
      publisher: "Paris Musées",
      locator: "Object 2021.6.29, date and material fields",
    },
  ],
};
assert.equal(
  (
    await call("/review/" + sid + "/decision", {
      method: "POST",
      cookie: staff,
      body: { ...review, sources: [] },
    })
  ).status,
  400,
);
ok(
  "Factual assertion publication requires supporting evidence and a rationale",
);
const approved = await call("/review/" + sid + "/decision", {
  method: "POST",
  cookie: staff,
  body: review,
});
assert.equal(approved.status, 200, JSON.stringify(approved.data));
s = approved.data;
assert.equal(s.state, "accepted");
assert.equal(
  (
    await call("/review/" + sid + "/decision", {
      method: "POST",
      cookie: staff,
      body: review,
    })
  ).status,
  409,
);
assert.equal(
  (
    await call("/review/" + sid + "/publish", {
      method: "POST",
      cookie: staff,
      body: { revision: review.revision },
    })
  ).status,
  409,
);
ok("Review stores reviewer/revision and blocks stale decision or publication");
const publication = await call("/review/" + sid + "/publish", {
  method: "POST",
  cookie: staff,
  body: { revision: s.revision },
});
assert.equal(publication.status, 200);
const lid = publication.data.id;
const detail = await call("/listings/" + lid);
assert.equal(detail.status, 200);
assert.equal(detail.data.authenticity, "not_assessed");
assert.equal(detail.data.provenance, "not_established");
assert(!JSON.stringify(detail.data).includes("Private notes"));
assert(!JSON.stringify(detail.data).includes(review.reason));
ok(
  "Publication uses a limited projection, independent trust labels and no private notes",
);
const interests = await Promise.all(
  [1, 2].map(() =>
    call("/listings/" + lid + "/interest", {
      method: "POST",
      cookie: b,
      body: {},
    }),
  ),
);
assert(
  interests.every(
    (r) =>
      r.status === 200 &&
      r.data.message.includes("no item is reserved or purchased"),
  ),
);
assert.equal(
  (await call("/listings/" + lid, { cookie: b })).data.interested,
  true,
);
ok(
  "Concurrent repeated interest requests are harmless; no sale or reservation is implied",
);
assert.equal(
  (
    await call("/reports", {
      method: "POST",
      cookie: b,
      body: {
        listingId: lid,
        reason:
          "Please check the cultural assertion and its supporting passage.",
      },
    })
  ).status,
  200,
);
assert.equal(
  (
    await call("/listings/" + lid + "/withdraw", {
      method: "POST",
      cookie: a,
      body: { reason: "A member cannot withdraw this listing." },
    })
  ).status,
  403,
);
assert.equal(
  (
    await call("/listings/" + lid + "/withdraw", {
      method: "POST",
      cookie: staff,
      body: {
        reason: "Withdrawing the association pending a fresh source review.",
      },
    })
  ).status,
  200,
);
assert.equal((await call("/listings/" + lid)).status, 404);
assert.equal(
  (
    await call("/review/" + sid + "/publish", {
      method: "POST",
      cookie: staff,
      body: { revision: s.revision },
    })
  ).status,
  409,
);
const withdrawn = (await call("/review/" + sid, { cookie: staff })).data;
assert.equal(withdrawn.state, "under_review");
assert(withdrawn.decisions.some((d) => d.decision === "withdrawn"));
ok("Report, withdrawal, immediate public removal and fresh-review requirement");
for (const scenario of ["failure", "unknown", "label"]) {
  let d = await draft("Scenario " + scenario);
  d = (
    await call("/submissions/" + d.id + "/sample", {
      method: "POST",
      cookie: a,
      body: { revision: d.revision, sample: scenario },
    })
  ).data;
  d = (
    await call("/submissions/" + d.id + "/submit", {
      method: "POST",
      cookie: a,
      body: { revision: d.revision },
    })
  ).data;
  assert.equal(
    d.recognition.outcome,
    { failure: "failed", unknown: "unknown", label: "needs_more_information" }[
      scenario
    ],
  );
  if (scenario === "failure") {
    const retry = await call("/submissions/" + d.id + "/identify", {
      method: "POST",
      cookie: a,
      body: {},
    });
    assert.equal(retry.data.outcome, "candidates");
  }
  if (scenario === "label") {
    const requested = await call("/review/" + d.id + "/decision", {
      method: "POST",
      cookie: staff,
      body: {
        revision: d.revision,
        decision: "needs_more_information",
        reason:
          "Please add a readable label or declare that the label is missing.",
      },
    });
    assert.equal(requested.status, 200);
    d = requested.data;
    d = (
      await call("/submissions/" + d.id, {
        method: "PATCH",
        cookie: a,
        body: {
          ...d.data,
          notes:
            "The label is missing; no further label photograph is available.",
          revision: d.revision,
        },
      })
    ).data;
    d = (
      await call("/submissions/" + d.id + "/submit", {
        method: "POST",
        cookie: a,
        body: { revision: d.revision },
      })
    ).data;
    assert.equal(d.state, "under_review");
  }
}
ok(
  "No-match, evidence-request/response and failed-recognition retry all remain usable",
);
let imageDraft = await draft("Private image validation");
const png = new Uint8Array(
  await sharp({
    create: { width: 24, height: 24, channels: 3, background: "#9b7c62" },
  })
    .png()
    .toBuffer(),
);
const headers = {
  "Content-Type": "image/png",
  "x-rights": "confirmed",
  "x-publish-permission": "yes",
  "x-slot": "front",
};
async function upload(bytes, extra = {}) {
  return call("/submissions/" + imageDraft.id + "/uploads", {
    method: "POST",
    cookie: a,
    body: bytes,
    headers: {
      ...headers,
      "x-revision": String(imageDraft.revision),
      ...extra,
    },
  });
}
assert.equal(
  (await upload(new TextEncoder().encode("not an image"))).status,
  400,
);
const huge = new Uint8Array(png);
new DataView(huge.buffer).setUint32(16, 999999);
assert.equal((await upload(huge)).status, 400);
assert.equal((await upload(new Uint8Array(8 * 1024 * 1024 + 1))).status, 413);
ok(
  "Incorrect signatures, excessive dimensions, and oversized files are rejected",
);
for (let n = 0; n < 5; n++) {
  const uploaded = await upload(png);
  assert.equal(uploaded.status, 200, JSON.stringify(uploaded.data));
  imageDraft = uploaded.data;
}
assert.equal((await upload(png)).status, 400);
const mediaId = imageDraft.media[0].id;
assert.equal((await call("/media/" + mediaId, { cookie: b })).status, 404);
assert.equal((await call("/media/" + mediaId)).status, 401);
assert.equal((await call("/media/" + mediaId, { cookie: a })).status, 200);
assert.equal((await call("/public-media/" + mediaId)).status, 404);
ok("Five-image quota and direct private-image URL ownership enforced");
imageDraft = (
  await call("/submissions/" + imageDraft.id + "/submit", {
    method: "POST",
    cookie: a,
    body: { revision: imageDraft.revision },
  })
).data;
assert.equal(imageDraft.recognition.outcome, "unknown");
assert.equal(imageDraft.recognition.candidates.length, 0);
ok("Arbitrary uploads never receive a prepared exact match");
const acceptedImage = await call("/review/" + imageDraft.id + "/decision", {
  method: "POST",
  cookie: staff,
  body: {
    ...review,
    revision: imageDraft.revision,
    title: "Uploaded image demo",
    modelId: "",
    claimType: "unresolved",
    sources: [],
  },
});
assert.equal(acceptedImage.status, 200);
imageDraft = acceptedImage.data;
const imgPublication = await call("/review/" + imageDraft.id + "/publish", {
  method: "POST",
  cookie: staff,
  body: { revision: imageDraft.revision },
});
assert.equal(imgPublication.status, 200);
const derivative = await call("/public-media/" + mediaId);
assert.equal(derivative.status, 200);
assert.equal((await sharp(derivative.data).metadata()).format, "webp");
await call("/listings/" + imgPublication.data.id + "/withdraw", {
  method: "POST",
  cookie: staff,
  body: { reason: "End of media publication acceptance scenario." },
});
assert.equal((await call("/public-media/" + mediaId)).status, 404);
ok("Public derivatives are re-encoded and disappear immediately on withdrawal");
assert.equal(
  (
    await call("/submissions", {
      method: "POST",
      cookie: a,
      body: { id: crypto.randomUUID() },
      headers: { Origin: "https://unrelated.invalid" },
    })
  ).status,
  403,
);
ok("Cross-origin state-changing requests are rejected");
const final = (await call("/review", { cookie: staff })).data;
assert(final.events.some((e) => e.action === "interest"));
assert(final.events.some((e) => e.action === "review_completed"));
assert(final.events.some((e) => e.action === "upload_failed"));
ok(
  "Demo activity records interest, reviews and upload failures without raw evidence",
);
console.log(`\n${passed} acceptance groups passed.`);
