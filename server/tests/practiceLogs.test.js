const request = require("supertest");
const { createApp } = require("../expressApp");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Practice log routes", () => {
  const app = createApp();

  it("creates and lists practice logs for a member", async () => {
    const member = await createUser({ email: "practice-member@test.com" });

    const createRes = await request(app)
      .post("/api/practice-logs")
      .set("Authorization", buildAuthHeader(member))
      .send({ durationMinutes: 30, focusArea: "pitch", selfRating: 4 });

    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/practice-logs")
      .set("Authorization", buildAuthHeader(member));

    expect(listRes.status).toBe(200);
    expect(listRes.body.logs.length).toBe(1);
  });
});
