const request = require("supertest");
const { createApp } = require("../app");

describe("Health endpoints", () => {
  const app = createApp();

  it("returns running message on root", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Choir App API is running");
  });

  it("returns health status when database is connected", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.mongooseState).toBe(1);
  });
});
