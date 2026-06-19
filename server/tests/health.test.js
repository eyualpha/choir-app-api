const request = require("supertest");
const { createApp } = require("../app");

describe("Health endpoints", () => {
  const app = createApp();

  it("returns service info on root", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("HarmoniQ API");
    expect(res.body.status).toBe("running");
  });

  it("returns health status when database is connected", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.mongooseState).toBe(1);
    expect(res.body.service).toBe("HarmoniQ API");
  });
});
