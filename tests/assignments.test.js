const request = require("supertest");
const { createApp } = require("../app");
const ChoirAssignment = require("../models/assignment.model");
const { sendAssignmentEmail } = require("../utils/sendEmail");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Assignment routes", () => {
  const app = createApp();

  it("adds a user to a choir category as admin", async () => {
    const admin = await createUser({
      email: "assign-admin@test.com",
      role: "admin",
    });
    const singer = await createUser({ email: "singer@test.com" });

    const res = await request(app)
      .post("/api/assignments")
      .set("Authorization", buildAuthHeader(admin))
      .send({ userId: singer._id.toString(), category: "leadSingers" });

    expect(res.status).toBe(200);
    expect(sendAssignmentEmail).toHaveBeenCalled();
    const assignment = await ChoirAssignment.findOne();
    expect(assignment.leadSingers.map(String)).toContain(singer._id.toString());
  });

  it("rejects invalid assignment categories", async () => {
    const admin = await createUser({
      email: "assign-invalid@test.com",
      role: "admin",
    });
    const singer = await createUser({ email: "invalid-singer@test.com" });

    const res = await request(app)
      .post("/api/assignments")
      .set("Authorization", buildAuthHeader(admin))
      .send({ userId: singer._id.toString(), category: "drummers" });

    expect(res.status).toBe(400);
  });

  it("returns populated assignments", async () => {
    const admin = await createUser({
      email: "assign-get-admin@test.com",
      role: "admin",
    });
    const singer = await createUser({ email: "assign-get-singer@test.com" });
    await ChoirAssignment.create({
      leadSingers: [singer._id],
      backupSingers: [],
      prayerTeam: [],
      assignedBy: admin._id,
    });

    const res = await request(app)
      .get("/api/assignments")
      .set("Authorization", buildAuthHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.assignment.leadSingers[0].email).toBe("assign-get-singer@test.com");
  });

  it("removes a user from a category", async () => {
    const admin = await createUser({
      email: "assign-remove-admin@test.com",
      role: "admin",
    });
    const singer = await createUser({ email: "assign-remove-singer@test.com" });
    await ChoirAssignment.create({
      leadSingers: [singer._id],
      backupSingers: [],
      prayerTeam: [],
      assignedBy: admin._id,
    });

    const res = await request(app)
      .delete(`/api/assignments/${singer._id}`)
      .set("Authorization", buildAuthHeader(admin))
      .send({ userId: singer._id.toString(), category: "leadSingers" });

    expect(res.status).toBe(200);
    const assignment = await ChoirAssignment.findOne();
    expect(assignment.leadSingers).toHaveLength(0);
  });
});
