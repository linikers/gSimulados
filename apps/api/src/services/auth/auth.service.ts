import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, IUserDocument, Escola, Aluno } from "../../models/User";
import { env } from "../../config/env";

export class AuthService {
  static async generateToken(user: IUserDocument) {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  static async register(data: any) {
    const { email, password, role, ...rest } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const baseData = { email, password: hashedPassword, role, ...rest };

    let user;
    if (role === "escola") {
      user = new Escola(baseData);
    } else if (role === "aluno") {
      user = new Aluno(baseData);
    } else {
      user = new User(baseData); // Admin or generic
    }

    await user.save();
    const token = await this.generateToken(user as IUserDocument);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }

  static async login(data: any) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password!))) {
      throw new Error("Invalid credentials");
    }

    const token = await this.generateToken(user);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }
}
