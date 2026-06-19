const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Auth middleware", () => {
  it("rejects missing authorization header", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    isAuthenticated(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts valid bearer token", () => {
    const token = jwt.sign(
      { id: "abc", role: "member", name: "Test", email: "a@b.com" },
      process.env.JWT_SECRET
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe("member");
  });

  it("blocks non-admin users", () => {
    const req = { user: { role: "member" } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows admin users", () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
