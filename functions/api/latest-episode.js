// Latest Fall From Grace episode, read from the Riverside RSS feed.
const FEED = "https://api.riverside.com/hosting/k5xF5oeL.rss";
const pick = (s, re) => { const m = s.match(re); return m ? m[1].trim() : ""; };
const clean = (s) => s.replace(/^<!\[CDATA\[|\]\]>$/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
export async function onRequestGet() {
  try {
    const res = await fetch(FEED, { cf: { cacheTtl: 1800, cacheEverything: true } });
    const xml = await res.text();
    const item = pick(xml, /<item>([\s\S]*?)<\/item>/);
    if (!item) throw new Error("no item");
    const out = {
      title: clean(pick(item, /<title>([\s\S]*?)<\/title>/)),
      date: pick(item, /<pubDate>([\s\S]*?)<\/pubDate>/),
      audio: (item.match(/<enclosure[^>]*url="([^"]+)"/) || [])[1] || "",
      duration: pick(item, /<itunes:duration>([\s\S]*?)<\/itunes:duration>/),
      image: (item.match(/<itunes:image[^>]*href="([^"]+)"/) || xml.match(/<itunes:image[^>]*href="([^"]+)"/) || [])[1] || "",
    };
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "public, max-age=1800" } });
  } catch (e) {
    return new Response("{}", { status: 502, headers: { "content-type": "application/json" } });
  }
}
