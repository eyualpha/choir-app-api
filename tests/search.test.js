const request = require("supertest");
const { createApp } = require("../app");
const { createUser, buildAuthHeader } = require("./helpers");

describe("Search routes", () => {
  const app = createApp();

  it("performs global search", async () => {
    const member = await createUser({ email: "search-member@test.com", name: "Searchable Name" });
    const res = await request(app)
      .get("/api/search?q=Searchable")
      .set("Authorization", buildAuthHeader(member));

    expect(res.status).toBe(200);
    expect(res.body.totalMatches).toBeGreaterThanOrEqual(1);
  });
});
