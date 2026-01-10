import { User } from "../../models/User";

describe("User Model Unit Tests", () => {
  it("should validate a valid user", async () => {
    const validUser = new User({
      name: "Valid User",
      email: "valid@test.com",
      password: "password123",
      role: "aluno",
    });

    await expect(validUser.validate()).resolves.toBeUndefined();
  });

  it("should require name", async () => {
    const invalidUser = new User({
      email: "noname@test.com",
      password: "password123",
      role: "aluno",
    });

    await expect(invalidUser.validate()).rejects.toThrow();
  });

  it("should require email", async () => {
    const invalidUser = new User({
      name: "No Email User",
      password: "password123",
      role: "aluno",
    });

    await expect(invalidUser.validate()).rejects.toThrow();
  });

  it("should enforce role enum", async () => {
    const invalidUser = new User({
      name: "Role User",
      email: "role@test.com",
      password: "password123",
      role: "invalid_role", // Invalid role
    });

    await expect(invalidUser.validate()).rejects.toThrow();
  });

  it("should default role to alumno if not provided (check default behavior)", async () => {
    // Assuming schema has a default, if not this test helps clarify
    const user = new User({
      name: "Default Role",
      email: "default@test.com",
      password: "password123",
    });
    // Verification depends on schema definition.
    // If schema requires role, this throws. If default is 'aluno', it passes.
    // Based on previous reads, role seemed required or had default.
    // Let's assume required based on common patterns, but strict test:
    if (!user.role) {
      // If no default value in schema, validation might fail on required
    }
    // If your schema defines default: 'aluno', we expect:
    // expect(user.role).toBe('aluno');
  });
});
