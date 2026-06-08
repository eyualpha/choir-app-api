const {
  normalizeVoicePart,
  suggestVoicePartBalance,
  compareVoicePartCoverage,
} = require("../utils/voicePartHelpers");
const { toSlug, isValidSlug } = require("../utils/slugHelpers");
const { isValidDateRange, overlaps } = require("../utils/dateHelpers");

describe("Utility helpers", () => {
  it("normalizes voice parts", () => {
    expect(normalizeVoicePart("soprano")).toBe("Soprano");
    expect(normalizeVoicePart("unknown")).toBe("Other");
  });

  it("suggests voice part balance", () => {
    const result = suggestVoicePartBalance({ Soprano: 2, Alto: 2, Tenor: 2, Bass: 2, Other: 2 });
    expect(result.balanced).toBe(true);
  });

  it("compares voice part coverage", () => {
    const coverage = compareVoicePartCoverage(["Soprano", "Bass"], [
      { voicePart: "Soprano" },
      { voicePart: "Alto" },
    ]);
    expect(coverage.find((c) => c.part === "Soprano").covered).toBe(true);
    expect(coverage.find((c) => c.part === "Bass").covered).toBe(false);
  });

  it("builds slugs", () => {
    expect(toSlug("Hello World!")).toBe("hello-world");
    expect(isValidSlug("hello-world")).toBe(true);
  });

  it("validates date ranges and overlaps", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-02");
    expect(isValidDateRange(start, end)).toBe(true);
    expect(overlaps(start, end, new Date("2026-06-01T12:00"), new Date("2026-06-03"))).toBe(true);
  });
});
