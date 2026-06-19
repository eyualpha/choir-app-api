const request = require("supertest");
const { createApp } = require("../expressApp");
const Announcement = require("../models/annoucement.model");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Announcement routes", () => {
  const app = createApp();

  it("creates an announcement as admin", async () => {
    const admin = await createUser({
      email: "announce-admin@test.com",
      role: "admin",
    });

    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", buildAuthHeader(admin))
      .field("title", "Practice Tonight")
      .field("message", "Be on time at 7 PM");

    expect(res.status).toBe(201);
    expect(res.body.announcement.title).toBe("Practice Tonight");
  });

  it("lists active announcements for members", async () => {
    const member = await createUser({ email: "announce-member@test.com" });
    const admin = await createUser({
      email: "announce-admin2@test.com",
      role: "admin",
    });
    await Announcement.create({
      title: "Welcome",
      message: "Hello choir",
      createdBy: admin._id,
      isActive: true,
    });

    const res = await request(app)
      .get("/api/announcements")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  it("deletes an announcement as admin", async () => {
    const admin = await createUser({
      email: "announce-delete@test.com",
      role: "admin",
    });
    const announcement = await Announcement.create({
      title: "Old",
      message: "Remove me",
      createdBy: admin._id,
    });

    const res = await request(app)
      .delete(`/api/announcements/${announcement._id}`)
      .set("Authorization", buildAuthHeader(admin));

    expect(res.status).toBe(200);
    const remaining = await Announcement.findById(announcement._id);
    expect(remaining).toBeNull();
  });
});
