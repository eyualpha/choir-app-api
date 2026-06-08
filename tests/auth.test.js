const request = require("supertest");
const bcrypt = require("bcrypt");
const { createApp } = require("../app");
const User = require("../models/user.model");
const { sendEmail, sendResetOtpEmail } = require("../utils/sendEmail");
const { createUser } = require("./helpers");

describe("Auth routes", () => {
  const app = createApp();

  it("registers a user and sends welcome email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "New Member",
      email: "new@test.com",
      role: "member",
      voicePart: "Alto",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/created/i);
    expect(sendEmail).toHaveBeenCalled();
    const saved = await User.findOne({ email: "new@test.com" });
    expect(saved).toBeTruthy();
    expect(saved.name).toBe("New Member");
  });

  it("logs in with valid credentials", async () => {
    await createUser({ email: "login@test.com", password: "secret123" });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "secret123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("login@test.com");
  });

  it("rejects invalid login credentials", async () => {
    await createUser({ email: "badlogin@test.com" });

    const res = await request(app).post("/api/auth/login").send({
      email: "badlogin@test.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  it("rejects deactivated users", async () => {
    await createUser({ email: "inactive@test.com", isActive: false });

    const res = await request(app).post("/api/auth/login").send({
      email: "inactive@test.com",
      password: "password123",
    });

    expect(res.status).toBe(403);
  });

  it("requests password reset OTP", async () => {
    await createUser({ email: "reset@test.com" });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "reset@test.com" });

    expect(res.status).toBe(200);
    expect(sendResetOtpEmail).toHaveBeenCalled();
    const user = await User.findOne({ email: "reset@test.com" });
    expect(user.resetOtp).toHaveLength(6);
  });

  it("verifies OTP and sets a new password", async () => {
    const user = await createUser({ email: "otp@test.com" });
    user.resetOtp = "123456";
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const verify = await request(app)
      .post("/api/auth/reset-password/verify")
      .send({ email: "otp@test.com", otp: "123456" });
    expect(verify.status).toBe(200);

    const setPwd = await request(app).post("/api/auth/reset-password/set").send({
      email: "otp@test.com",
      otp: "123456",
      password: "newpass1",
      confirmPassword: "newpass1",
    });
    expect(setPwd.status).toBe(200);

    const updated = await User.findOne({ email: "otp@test.com" });
    const matches = await bcrypt.compare("newpass1", updated.passwordHash);
    expect(matches).toBe(true);
    expect(updated.isPasswordChanged).toBe(true);
  });
});
