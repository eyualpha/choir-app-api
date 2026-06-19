const {
  inferResourceType,
  cloudResourceTypeForMime,
} = require("../utils/resourceType");

describe("resource type helpers", () => {
  it("uses explicit type when valid", () => {
    expect(inferResourceType("application/octet-stream", "audio")).toBe("audio");
  });

  it("infers audio from mime type", () => {
    expect(inferResourceType("audio/mpeg")).toBe("audio");
  });

  it("infers lyrics from text mime", () => {
    expect(inferResourceType("text/plain")).toBe("lyrics");
  });

  it("maps image mime to cloudinary image resource", () => {
    expect(cloudResourceTypeForMime("image/png")).toBe("image");
  });

  it("defaults unknown mime to raw cloudinary resource", () => {
    expect(cloudResourceTypeForMime("application/pdf")).toBe("raw");
  });
});
