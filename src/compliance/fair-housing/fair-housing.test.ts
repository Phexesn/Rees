import { describe, expect, it } from "vitest";
import { checkOutput, checkText, loadRules } from "@/compliance/fair-housing";

const clean = (text: string, lang: string) => checkText(text, lang);

function expectRemoved(text: string, lang: string, keep = "") {
  const result = clean(text, lang);
  expect(result.issues.some((i) => i.action === "removed"), `expected a removal in: ${text}`).toBe(true);
  expect(result.text).toBe(keep);
}

function expectFlagged(text: string, lang: string) {
  const result = clean(text, lang);
  expect(result.issues.some((i) => i.action === "flagged"), `expected a flag in: ${text}`).toBe(true);
  expect(result.text).toBe(text);
}

function expectRewritten(text: string, lang: string, expected: string) {
  const result = clean(text, lang);
  expect(result.issues.some((i) => i.action === "rewritten")).toBe(true);
  expect(result.text).toBe(expected);
}

function expectClean(text: string, lang: string) {
  const result = clean(text, lang);
  expect(result.issues, `unexpected issue in: ${text}`).toEqual([]);
  expect(result.text).toBe(text);
}

describe("rules file", () => {
  it("loads, compiles every pattern and has unique ids", () => {
    const { rules } = loadRules();
    expect(rules.length).toBeGreaterThan(50);
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
  });

  it("covers every shipped UI language with several rules", () => {
    const { rules } = loadRules();
    for (const lang of ["en", "es", "zh", "vi", "ko"]) {
      expect(rules.filter((r) => r.lang === lang).length, lang).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("English — clear violations are removed", () => {
  it("no children", () => expectRemoved("No children allowed. Great kitchen.", "en", "Great kitchen."));
  it("adults only", () => expectRemoved("Adults only building.", "en"));
  it("perfect for young families", () =>
    expectRemoved("Perfect for young families. The home has 4 bedrooms.", "en", "The home has 4 bedrooms."));
  it("ideal for empty nesters", () => expectRemoved("Ideal for empty nesters.", "en"));
  it("great for retirees", () => expectRemoved("Spacious lot. Great for retirees!", "en", "Spacious lot."));
  it("mature adults", () => expectRemoved("Mature adults preferred.", "en"));
  it("couples only", () => expectRemoved("Couples only.", "en"));
  it("women only", () => expectRemoved("Women only.", "en"));
  it("no wheelchairs", () => expectRemoved("No wheelchairs.", "en"));
  it("not suitable for the disabled", () => expectRemoved("Not suitable for the disabled.", "en"));
  it("no section 8", () => expectRemoved("Freshly painted. No Section 8.", "en", "Freshly painted."));
  it("race of neighborhood", () => expectRemoved("Located in a quiet white neighborhood.", "en"));
  it("ethnic community", () => expectRemoved("Part of a thriving Hispanic community.", "en"));
  it("english-speaking only", () => expectRemoved("English-speaking only.", "en"));
  it("religious preference", () => expectRemoved("Christian home with a big yard.", "en"));
  it("military status", () => expectRemoved("No military.", "en"));
  it("citizenship", () => expectRemoved("Must be a US citizen.", "en"));
  it("ethnic neighborhood", () => expectRemoved("In an ethnic neighborhood close to shops.", "en"));
});

describe("English — safe rewrites keep the copy", () => {
  it("master bedroom → primary bedroom", () =>
    expectRewritten("Master bedroom with walk-in closet.", "en", "Primary bedroom with walk-in closet."));
  it("keeps capitalization style", () => expectRewritten("MASTER SUITE", "en", "PRIMARY SUITE"));
  it("mother-in-law suite → guest suite", () =>
    expectRewritten("Mother-in-law suite over the garage.", "en", "Guest suite over the garage."));
  it("his and hers → dual", () => expectRewritten("His and hers closets.", "en", "Dual closets."));
  it("man cave → bonus room", () => expectRewritten("Finished man cave downstairs.", "en", "Finished bonus room downstairs."));
  it("handicap accessible → accessible", () =>
    expectRewritten("Handicap accessible bathroom.", "en", "Accessible bathroom."));
});

describe("English — risky wording is flagged for the agent", () => {
  it("safe neighborhood", () => expectFlagged("Tucked into a safe neighborhood.", "en"));
  it("top-rated schools", () => expectFlagged("Close to top-rated schools.", "en"));
  it("near a church", () => expectFlagged("Close to the church and library.", "en"));
  it("family-friendly", () => expectFlagged("A family-friendly street.", "en"));
  it("exclusive neighborhood", () => expectFlagged("An exclusive neighborhood.", "en"));
});

describe("English — normal property descriptions pass untouched", () => {
  it("walk-in closet, family room, walking distance", () =>
    expectClean("Walk-in closet, family room, great room, walking distance to shops.", "en"));
  it("plain facts", () => expectClean("Four bedrooms, 3 baths, quartz counters, new roof (2022).", "en"));
  it("landmarks", () => expectClean("Steps to the park and the farmers market.", "en"));
  it("perfect for entertaining", () => expectClean("Perfect for entertaining with an open floor plan.", "en"));
  it("masterfully renovated", () => expectClean("Masterfully renovated kitchen.", "en"));
});

describe("Spanish", () => {
  it("no se aceptan niños", () => expectRemoved("No se aceptan niños. Cocina nueva.", "es", "Cocina nueva."));
  it("ideal para parejas jóvenes", () => expectRemoved("Ideal para parejas jóvenes.", "es"));
  it("barrio hispano", () => expectRemoved("Barrio hispano tranquilo.", "es"));
  it("solo para mujeres", () => expectRemoved("Solo para mujeres.", "es"));
  it("no sección 8", () => expectRemoved("No sección 8.", "es"));
  it("vecindario seguro is flagged", () => expectFlagged("Vecindario seguro y tranquilo.", "es"));
  it("recámara master → recámara principal", () =>
    expectRewritten("Recámara master con baño.", "es", "Recámara principal con baño."));
  it("plain facts pass", () => expectClean("Cocina remodelada, tres recámaras, patio amplio.", "es"));
});

describe("Simplified Chinese", () => {
  it("适合华人家庭", () => expectRemoved("适合华人家庭的四房住宅", "zh"));
  it("不接受小孩", () => expectRemoved("不接受小孩。厨房宽敞。", "zh", "厨房宽敞。"));
  it("适合年轻夫妇", () => expectRemoved("非常适合年轻夫妇。", "zh"));
  it("仅限女性", () => expectRemoved("仅限女性。", "zh"));
  it("好学区 is flagged", () => expectFlagged("位于好学区。", "zh"));
  it("plain facts pass", () => expectClean("四卧三卫，开放式厨房，新屋顶。", "zh"));
});

describe("Vietnamese", () => {
  it("khu người Việt", () => expectRemoved("Nhà nằm trong khu người Việt.", "vi"));
  it("lý tưởng cho gia đình trẻ", () => expectRemoved("Lý tưởng cho gia đình trẻ.", "vi"));
  it("không nhận trẻ em", () => expectRemoved("Không nhận trẻ em.", "vi"));
  it("khu phố an toàn is flagged", () => expectFlagged("Khu phố an toàn.", "vi"));
  it("plain facts pass", () => expectClean("Nhà 4 phòng ngủ, bếp mới, sân sau rộng.", "vi"));
});

describe("Korean", () => {
  it("한인 밀집 지역", () => expectRemoved("한인 밀집 지역에 위치한 주택", "ko"));
  it("신혼부부에게 딱", () => expectRemoved("신혼부부에게 딱 맞는 집입니다.", "ko"));
  it("아이 불가", () => expectRemoved("아이 불가.", "ko"));
  it("여성 전용", () => expectRemoved("여성 전용.", "ko"));
  it("좋은 학군 is flagged", () => expectFlagged("좋은 학군.", "ko"));
  it("plain facts pass", () => expectClean("침실 4개, 욕실 3개, 새 지붕, 넓은 뒷마당.", "ko"));
});

describe("English rules also run on other languages (mixed copy)", () => {
  it("catches English phrase inside Spanish copy", () =>
    expectRemoved("Casa amplia. Adults only.", "es", "Casa amplia."));
});

describe("checkOutput walks structured AI output", () => {
  it("cleans nested strings, drops emptied list items and reports", () => {
    const { output, report } = checkOutput(
      {
        headline: "Master suite retreat",
        body: "Four bedrooms. Perfect for young couples.",
        hashtags: ["#JustListed", "Adults only", "#DreamKitchen"],
        meta: { notes: ["Safe neighborhood"] },
      },
      "en",
    );
    expect(output.headline).toBe("Primary suite retreat");
    expect(output.body).toBe("Four bedrooms.");
    expect(output.hashtags).toEqual(["#JustListed", "#DreamKitchen"]);
    expect(output.meta.notes).toEqual(["Safe neighborhood"]);
    expect(report.hadViolations).toBe(true);
    expect(report.needsReview).toBe(true);
    expect(report.issues.map((i) => i.path)).toEqual(
      expect.arrayContaining(["headline", "body", "hashtags[1]", "meta.notes[0]"]),
    );
  });

  it("returns a clean report for compliant copy", () => {
    const { report } = checkOutput({ a: "Three bedrooms and a big yard." }, "en");
    expect(report.issues).toEqual([]);
    expect(report.hadViolations).toBe(false);
    expect(report.needsReview).toBe(false);
  });
});
