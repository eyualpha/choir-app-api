const request = require("supertest");
const { createApp } = require("../app");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Event routes", () => {
  const app = createApp();

  const eventPayload = {
    title: "Sunday Rehearsal",
    startAt: new Date(Date.now() + 86400000).toISOString(),
    endAt: new Date(Date.now() + 90000000).toISOString(),
    eventType: "rehearsal",
    location: "Main Hall",
  };

  it("creates an event as admin", async () => {
    const admin = await createUser({ email: "event-admin@test.com", role: "admin" });
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", buildAuthHeader(admin))
      .send(eventPayload);

    expect(res.status).toBe(201);
    expect(res.body.event.title).toBe("Sunday Rehearsal");
  });

  it("lists events for authenticated members", async () => {
    const admin = await createUser({ email: "event-admin2@test.com", role: "admin" });
    const member = await createUser({ email: "event-member@test.com" });
    await request(app)
      .post("/api/events")
      .set("Authorization", buildAuthHeader(admin))
      .send(eventPayload);

    const res = await request(app)
      .get("/api/events")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeGreaterThanOrEqual(1);
  });

  it("returns upcoming events", async () => {
    const member = await createUser({ email: "event-upcoming@test.com" });
    const res = await request(app)
      .get("/api/events/upcoming")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
  });
});
