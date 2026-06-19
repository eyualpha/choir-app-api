const VOICE_PARTS = ["Soprano", "Alto", "Tenor", "Bass", "Other"];

const VOICE_PART_RANGES = {
  Soprano: { low: "C4", high: "A5", description: "Highest female voice" },
  Alto: { low: "G3", high: "E5", description: "Lower female voice" },
  Tenor: { low: "C3", high: "A4", description: "Higher male voice" },
  Bass: { low: "E2", high: "C4", description: "Lowest male voice" },
  Other: { low: "", high: "", description: "Flexible or unspecified voice part" },
};

const normalizeVoicePart = (value) => {
  if (!value) return "Other";
  const match = VOICE_PARTS.find((part) => part.toLowerCase() === String(value).toLowerCase());
  return match || "Other";
};

const isValidVoicePart = (value) => VOICE_PARTS.includes(normalizeVoicePart(value));

const getVoicePartInfo = (part) => {
  const normalized = normalizeVoicePart(part);
  return { part: normalized, ...VOICE_PART_RANGES[normalized] };
};

const suggestVoicePartBalance = (distribution) => {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  if (!total) return { balanced: true, recommendations: [] };
  const target = total / VOICE_PARTS.length;
  const recommendations = VOICE_PARTS.map((part) => {
    const count = distribution[part] || 0;
    const delta = count - target;
    return {
      part,
      count,
      delta: Math.round(delta),
      status: Math.abs(delta) <= 1 ? "balanced" : delta < 0 ? "understaffed" : "overstaffed",
    };
  });
  return {
    balanced: recommendations.every((item) => item.status === "balanced"),
    targetPerPart: Number(target.toFixed(1)),
    recommendations,
  };
};

const groupMembersByVoicePart = (members = []) => {
  const groups = VOICE_PARTS.reduce((acc, part) => {
    acc[part] = [];
    return acc;
  }, {});
  for (const member of members) {
    const part = normalizeVoicePart(member.voicePart);
    groups[part].push(member);
  }
  return groups;
};

const compareVoicePartCoverage = (requiredParts = [], availableMembers = []) => {
  const groups = groupMembersByVoicePart(availableMembers);
  return requiredParts.map((part) => ({
    part: normalizeVoicePart(part),
    required: true,
    availableCount: groups[normalizeVoicePart(part)]?.length || 0,
    covered: (groups[normalizeVoicePart(part)]?.length || 0) > 0,
  }));
};

module.exports = {
  VOICE_PARTS,
  VOICE_PART_RANGES,
  normalizeVoicePart,
  isValidVoicePart,
  getVoicePartInfo,
  suggestVoicePartBalance,
  groupMembersByVoicePart,
  compareVoicePartCoverage,
};
