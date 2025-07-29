import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.AUTH_SECRET!;

export const AuthAdapter = {
  // ========== Auth con Email ==========
  async createUser(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "ADMIN",
        image: null,
      },
    });
  },

  async verifyUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  },

  // ========== Auth con GitHub ==========
  async createOrUpdateGithubUser(githubId: string, email: string, name: string) {
    const now = new Date();
    
    // Buscar usuario por githubId o email
    const existingAccount = await prisma.account.findFirst({
      where: { 
        accountId: githubId,
        providerId: 'github'
      },
      include: { user: true }
    });

    if (existingAccount) {
      // Actualizar usuario existente
      return prisma.user.update({
        where: { id: existingAccount.userId },
        data: { 
          name,
          email,
          updatedAt: now
        }
      });
    }

    // Buscar por email por si el usuario ya existe pero no tiene cuenta GitHub asociada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Asociar cuenta GitHub a usuario existente
      await prisma.account.create({
        data: {
          id: uuidv4(),
          accountId: githubId,
          providerId: 'github',
          userId: existingUser.id,
          createdAt: now,
          updatedAt: now
        }
      });
      return existingUser;
    }

    // Crear nuevo usuario con cuenta GitHub
    return prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        name,
        emailVerified: true,
        password: await bcrypt.hash(uuidv4(), 10),
        role: 'ADMIN',
        image: null,
        createdAt: now,
        updatedAt: now,
        accounts: {
          create: {
            id: uuidv4(),
            accountId: githubId,
            providerId: 'github',
            createdAt: now,
            updatedAt: now
          }
        }
      }
    });
  },

  // ========== Manejo de Sesiones ==========
  async createSession(userId: string, ipAddress?: string, userAgent?: string) {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    const now = new Date();
    return prisma.session.create({
      data: {
        id: uuidv4(),
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        ipAddress: ipAddress || '',
        userAgent: userAgent || '',
        createdAt: now,
        updatedAt: now,
      },
    });
  },

  async deleteSession(token: string) {
    try {
      await prisma.session.delete({ 
        where: { token } 
      });
    } catch (error) {
      console.error("Error eliminando sesión:", error);
      // No lanzar error para no interrumpir el flujo de logout
    }
  },

  // Método adicional útil para cerrar todas las sesiones de un usuario
  async invalidateAllUserSessions(userId: string) {
    await prisma.session.deleteMany({
      where: { userId }
    });
  },

  // ========== Métodos adicionales útiles ==========
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async invalidateUserSessions(userId: string) {
    return prisma.session.deleteMany({ where: { userId } });
  },

  async getSessionByToken(token: string){
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    return session;
  
  },

  async getUserById(id: string){
    return await prisma.user.findUnique({
      where: { id },
    });
  },
};