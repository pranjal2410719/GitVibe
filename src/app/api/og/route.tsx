import { ImageResponse } from "next/og";
import { fetchProfile, GitHubError, USERNAME_RE } from "@/lib/github";
import { formatFullNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type GoogleFont = { name: string; data: ArrayBuffer; weight: FontWeight };

/** Pull a family + weights from Google Fonts as woff binaries for ImageResponse. */
async function googleFont(family: string, weights: FontWeight[]): Promise<GoogleFont[]> {
  // The css2 API serves woff2 to modern browsers, but ImageResponse only
  // supports ttf/otf/woff. An old UA makes Google serve woff instead.
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights.join(";")}&display=swap`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
      },
    },
  ).then((r) => r.text());

  const blocks = css.split("@font-face").slice(1);
  const fonts: GoogleFont[] = [];
  for (const block of blocks) {
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const urlMatch = block.match(/url\(([^)]+)\)/);
    if (!weightMatch || !urlMatch) continue;
    const weight = Number(weightMatch[1]) as FontWeight;
    const data = await fetch(urlMatch[1]).then((r) => r.arrayBuffer());
    fonts.push({ name: family, data, weight });
  }
  return fonts;
}

let fontsPromise: Promise<GoogleFont[]> | null = null;
function loadFonts(): Promise<GoogleFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      googleFont("Inter", [400, 700]),
      googleFont("Space Grotesk", [600, 700]),
    ]).then((groups) => groups.flat());
  }
  return fontsPromise;
}

const ARENA = 1200;
const SCENE_HEIGHT = 630;

function CardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: ARENA,
        height: SCENE_HEIGHT,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0b0d15",
        color: "#ffffff",
        fontFamily: "Inter",
        padding: 64,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -160,
          left: -80,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgb(139 92 246 / 0.55) 0%, transparent 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -120,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgb(244 63 94 / 0.38) 0%, transparent 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -140,
          left: 420,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgb(6 182 212 / 0.32) 0%, transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = (searchParams.get("u") ?? "").toLowerCase();
    const fonts = await loadFonts();
    const opts = {
      width: ARENA,
      height: SCENE_HEIGHT,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight as 400 | 700 })),
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=259200",
      },
    };

    if (!USERNAME_RE.test(u) || u.length > 39) {
      return new ImageResponse(
        (
          <CardShell>
            <BrandHeader />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 72, lineHeight: 1.05 }}>
                What does your GitHub say about you?
              </div>
              <div style={{ marginTop: 16, fontSize: 32, color: "rgba(255,255,255,0.6)" }}>
                Analyze your aura, chaos, energy — and get roasted by your own code.
              </div>
            </div>
            <Cta />
          </CardShell>
        ),
        opts,
      );
    }

    let profile;
    try {
      profile = await fetchProfile(u);
    } catch (err) {
      if (err instanceof GitHubError && err.status === 404) {
        return new ImageResponse(
          (
            <CardShell>
              <BrandHeader />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 36, color: "#fb7185" }}>@{u} isn&apos;t on GitHub</div>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 56, lineHeight: 1.05, marginTop: 8 }}>
                  Find your own developer aura.
                </div>
              </div>
              <Cta />
            </CardShell>
          ),
          opts,
        );
      }
      throw err;
    }

    const { raw, stats, personality } = profile;
    const user = raw.user!;
    const name = user.name ?? profile.username;

    return new ImageResponse(
      (
        <CardShell>
          <BrandHeader />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.55)" }}>
              What does your GitHub say about you?
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                marginTop: 12,
              }}
            >
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 68, lineHeight: 1.05 }}>
                {name}
              </div>
              <div style={{ fontSize: 34, color: "#a78bfa" }}>@{profile.username}</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: 14,
                marginTop: 24,
                padding: "14px 22px",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: 30 }}>{personality.archetype.emoji}</span>
              <span style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 28, color: "#fff" }}>
                {personality.archetype.title}
              </span>
              <span style={{ fontSize: 28, color: "rgba(255,255,255,0.4)" }}>·</span>
              <span style={{ fontSize: 28, color: "#c4b5fd", fontWeight: 700 }}>
                {personality.scores.aura.value}/100 {personality.scores.aura.label} aura
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 40,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: 28,
            }}
          >
            <Stat label="Repos" value={formatFullNumber(stats.repoCount)} />
            <Stat label="Stars" value={formatFullNumber(stats.stars)} />
            <Stat label="Followers" value={formatFullNumber(stats.followers)} />
            <Stat label="Contribs" value={formatFullNumber(stats.contributions?.total ?? 0)} />
            <Stat label="Streak" value={`${stats.contributions?.longestStreak ?? 0}d`} />
          </div>
        </CardShell>
      ),
      opts,
    );
  } catch (err) {
    console.error("OG image generation failed", err);
    return new Response("OG image failed", { status: 500 });
  }
}

function BrandHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        paddingBottom: 28,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          background: "linear-gradient(135deg, #7c3aed, #e11d48 55%, #06b6d4)",
        }}
      >
        ✨
      </div>
      <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 32, color: "#fff" }}>
        GitVibe
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.45)" }}>Developer Personality Lab</div>
    </div>
  );
}

function Cta() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
        borderTop: "1px solid rgba(255,255,255,0.12)",
        paddingTop: 28,
      }}
    >
      <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
        Your GitHub has an aura. What&apos;s yours?
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 28px",
          borderRadius: 16,
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          fontSize: 26,
          color: "#fff",
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
        }}
      >
        Analyze your aura →
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          fontSize: 34,
          color: "#fff",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.5 }}>
        {label}
      </div>
    </div>
  );
}
