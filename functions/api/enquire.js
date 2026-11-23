// Sends enquiries to hello@baileycode.com via Resend when RESEND_API_KEY is set.
// Without a key it returns 503 and the page falls back to a mailto link.
const esc = (s) => String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) return new Response("{}", { status: 503 });
  let d; try { d = await request.json(); } catch { return new Response("{}", { status: 400 }); }
  if (d.website || !d.name || !d.email || !d.message || String(d.message).length > 5000) return new Response("{}", { status: 400 });
  const topics = { ai: "AI consulting", counselling: "Counselling waitlist", support: "Support work", other: "Enquiry" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.FROM || "Bailey Code <enquiries@baileycode.com>",
      to: [env.TO || "hello@baileycode.com"],
      reply_to: d.email,
      subject: `[${topics[d.topic] || "Enquiry"}] ${String(d.name).slice(0, 80)}`,
      html: `<p><b>${esc(d.name)}</b> (${esc(d.email)})${d.org ? " · " + esc(d.org) : ""}</p><p>${esc(d.message).replace(/\n/g, "<br>")}</p>`,
    }),
  });
  return new Response("{}", { status: res.ok ? 200 : 502 });
}
