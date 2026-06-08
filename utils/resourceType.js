const inferResourceType = (mimetype, explicitType) => {
  if (explicitType) {
    const t = explicitType.toLowerCase();
    if (["lyrics", "pdf", "audio", "video"].includes(t)) return t;
  }

  if (!mimetype) return "pdf";

  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("text/")) return "lyrics";
  if (mimetype.includes("word") || mimetype.includes("officedocument"))
    return "pdf";

  return "pdf";
};

const cloudResourceTypeForMime = (mimetype) => {
  if (!mimetype) return "raw";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "video";
  return "raw";
};

module.exports = { inferResourceType, cloudResourceTypeForMime };
