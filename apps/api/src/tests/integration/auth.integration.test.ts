import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/User";

describe("Auth Endpoints", () => {
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "aluno",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", userData.email);
    expect(res.body.user).not.toHaveProperty("password");

    const user = await User.findOne({ email: userData.email });
    expect(user).toBeTruthy();
  });

  it("should not register a user with existing email", async () => {
    await request(app).post("/auth/register").send(userData);
    const res = await request(app).post("/auth/register").send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should login with valid credentials", async () => {
    await request(app).post("/auth/register").send(userData);

    const res = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", userData.email);
  });

  it("should not login with invalid password", async () => {
    await request(app).post("/auth/register").send(userData);

    const res = await request(app).post("/auth/login").send({
      email: userData.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
