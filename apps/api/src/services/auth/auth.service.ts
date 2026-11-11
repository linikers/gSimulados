import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, IUserDocument, Escola, Aluno, Admin } from "../../models/User";
import { env } from "../../config/env";
import { RefreshTokenService } from "./refresh-token.service";

export class AuthService {
  static async generateToken(user: IUserDocument) {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  static async register(data: any, userAgent?: string) {
    const { email, password, role, ...rest } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Usuário já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const baseData = { email, password: hashedPassword, role, ...rest };

    let user;
    if (role === "escola") {
      user = new Escola(baseData);
    } else if (role === "aluno") {
      user = new Aluno(baseData);
    } else if (role === "admin") {
      user = new Admin(baseData);
    } else {
      user = new User(baseData);
    }

    await user.save();
    const token = await this.generateToken(user as IUserDocument);
    const refreshToken = await RefreshTokenService.criar(
      String(user._id),
      userAgent,
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token, refreshToken };
  }

  static async login(data: any, userAgent?: string) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password!))) {
      throw new Error("Acesso não permitido");
    }

    const token = await this.generateToken(user);
    const refreshToken = await RefreshTokenService.criar(
      String(user._id),
      userAgent,
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token, refreshToken };
  }

  /**
   * Renova o access token a partir do refresh. Rotaciona o refresh (o antigo
   * morre) e confere se o usuário ainda existe antes de emitir outro.
   */
  static async refresh(token: string, userAgent?: string) {
    const { usuarioId, refreshToken } =
      await RefreshTokenService.rotacionar(token, userAgent);

    const user = await User.findById(usuarioId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const novoAccess = await this.generateToken(user as IUserDocument);
    return { token: novoAccess, refreshToken, userId: usuarioId };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      await RefreshTokenService.revogar(refreshToken);
    }
  }
}
