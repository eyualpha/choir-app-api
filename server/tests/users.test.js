const request = require("supertest");
const { createApp } = require("../expressApp");
const { createUser, buildAuthHeader } = require("./helpers");

describe("User routes", () => {
  const app = createApp();

  it("lists users for authenticated members", async () => {
    const member = await createUser({ email: "member-list@test.com" });
    await createUser({ email: "member-two@test.com", name: "Second" });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(res.body.users[0].passwordHash).toBeUndefined();
  });

  it("updates password for authenticated user", async () => {
    const user = await createUser({ email: "changepwd@test.com" });

    const res = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", buildAuthHeader(user))
      .send({ password: "newpass9", confirmPassword: "newpass9" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects password change when passwords do not match", async () => {
    const user = await createUser({ email: "mismatch@test.com" });

    const res = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", buildAuthHeader(user))
      .send({ password: "abc123", confirmPassword: "xyz789" });

    expect(res.status).toBe(400);
  });

  it("allows admin to update sub-team", async () => {
    const admin = await createUser({
      email: "admin-sub@test.com",
      role: "admin",
    });
    const member = await createUser({ email: "subteam@test.com" });

    const res = await request(app)
      .patch(`/api/users/${member._id}/subteam`)
      .set("Authorization", buildAuthHeader(admin))
      .send({ subTeam: "zema" });

    expect(res.status).toBe(200);
    expect(res.body.user.subTeam).toBe("zema");
  });

  it("blocks non-admin from deleting users", async () => {
    const member = await createUser({ email: "deleter@test.com" });
    const target = await createUser({ email: "target@test.com" });

    const res = await request(app)
      .delete(`/api/users/${target._id}`)
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(403);
  });

  it("allows admin to delete users", async () => {
    const admin = await createUser({
      email: "admin-delete@test.com",
      role: "admin",
    });
    const target = await createUser({ email: "delete-target@test.com" });

    const res = await request(app)
      .delete(`/api/users/${target._id}`)
      .set("Authorization", buildAuthHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
