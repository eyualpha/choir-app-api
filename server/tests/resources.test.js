const request = require("supertest");
const { createApp } = require("../expressApp");
const Resource = require("../models/resource.model");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Resource routes", () => {
  const app = createApp();

  it("rejects upload from non-admin members", async () => {
    const member = await createUser({ email: "resource-member@test.com" });

    const res = await request(app)
      .post("/api/resources/upload")
      .set("Authorization", buildAuthHeader(member))
      .field("title", "Sunday Hymn")
      .attach("files", Buffer.from("pdf-content"), {
        filename: "sheet.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(403);
  });

  it("rejects upload without title", async () => {
    const admin = await createUser({
      email: "resource-no-title@test.com",
      role: "admin",
    });

    const res = await request(app)
      .post("/api/resources/upload")
      .set("Authorization", buildAuthHeader(admin))
      .attach("files", Buffer.from("pdf-content"), {
        filename: "sheet.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(400);
  });

  it("uploads a resource file as admin", async () => {
    const admin = await createUser({
      email: "resource-upload@test.com",
      role: "admin",
    });

    const res = await request(app)
      .post("/api/resources/upload")
      .set("Authorization", buildAuthHeader(admin))
      .field("title", "Sunday Hymn")
      .field("description", "Main song")
      .attach("files", Buffer.from("pdf-content"), {
        filename: "sheet.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.resources).toHaveLength(1);
    expect(res.body.resources[0].type).toBe("pdf");
  });

  it("lists uploaded resources", async () => {
    const member = await createUser({ email: "resource-list@test.com" });
    await Resource.create({
      title: "Choir Book",
      type: "pdf",
      file: {
        url: "https://example.com/book.pdf",
        public_id: "book",
        mimeType: "application/pdf",
        size: 100,
      },
      uploadedBy: member._id,
    });

    const res = await request(app)
      .get("/api/resources")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  it("deletes a resource as admin", async () => {
    const admin = await createUser({
      email: "resource-delete@test.com",
      role: "admin",
    });
    const resource = await Resource.create({
      title: "Remove",
      type: "pdf",
      file: {
        url: "https://example.com/remove.pdf",
        public_id: "remove-id",
        mimeType: "application/pdf",
        size: 50,
      },
      uploadedBy: admin._id,
    });

    const res = await request(app)
      .delete(`/api/resources/${resource._id}`)
      .set("Authorization", buildAuthHeader(admin));

    expect(res.status).toBe(200);
    const deleted = await Resource.findById(resource._id);
    expect(deleted).toBeNull();
  });
});
