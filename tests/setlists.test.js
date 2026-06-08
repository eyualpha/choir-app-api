const request = require("supertest");
const { createApp } = require("../app");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Setlist routes", () => {
  const app = createApp();

  async function seedSong(admin) {
    const res = await request(app)
      .post("/api/songs")
      .set("Authorization", buildAuthHeader(admin))
      .send({ title: "Setlist Song", composer: "Test" });
    return res.body.song._id;
  }

  it("creates and retrieves a setlist", async () => {
    const admin = await createUser({ email: "setlist-admin@test.com", role: "admin" });
    const songId = await seedSong(admin);

    const createRes = await request(app)
      .post("/api/setlists")
      .set("Authorization", buildAuthHeader(admin))
      .send({
        title: "Sunday Service",
        items: [{ order: 1, song: songId, estimatedMinutes: 5 }],
      });

    expect(createRes.status).toBe(201);

    const getRes = await request(app)
      .get(`/api/setlists/${createRes.body.setlist._id}`)
      .set("Authorization", buildAuthHeader(admin));

    expect(getRes.status).toBe(200);
    expect(getRes.body.setlist.title).toBe("Sunday Service");
  });
});
