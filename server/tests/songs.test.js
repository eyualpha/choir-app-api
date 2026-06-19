const request = require("supertest");
const { createApp } = require("../app");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Song routes", () => {
  const app = createApp();

  it("creates a song as admin", async () => {
    const admin = await createUser({ email: "song-admin@test.com", role: "admin" });
    const res = await request(app)
      .post("/api/songs")
      .set("Authorization", buildAuthHeader(admin))
      .send({
        title: "Amazing Grace",
        composer: "Traditional",
        category: "hymn",
        difficulty: "beginner",
      });

    expect(res.status).toBe(201);
    expect(res.body.song.title).toBe("Amazing Grace");
  });

  it("lists songs for members", async () => {
    const admin = await createUser({ email: "song-admin2@test.com", role: "admin" });
    const member = await createUser({ email: "song-member@test.com" });
    await request(app)
      .post("/api/songs")
      .set("Authorization", buildAuthHeader(admin))
      .send({ title: "How Great Thou Art", composer: "Hine" });

    const res = await request(app)
      .get("/api/songs")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(res.body.songs.length).toBeGreaterThanOrEqual(1);
  });
});
