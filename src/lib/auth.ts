import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { createOrUpdateOAuthUser, createUser, getUserByEmail, getUserById, seedInitialData } from "./db";
import { verifyGoogleIdToken } from "./google-auth";

// Auto-detección de URL en Vercel
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.NEXTAUTH_URL = "https://aqui-estamos-v3.vercel.app";
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "DjangoPY89_Secret_Production_Key_2026_AquiEstamos",
  providers: [
    // Proveedor Google OAuth Oficial (cuando se proporcionan las claves en .env)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Proveedor Apple OAuth Oficial (cuando se proporcionan las claves en .env)
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
          }),
        ]
      : []),

    // Proveedor de Credenciales, Google Identity Services (GIS), Apple ID y Modo Demo
    CredentialsProvider({
      id: "credentials",
      name: "Email y Contraseña",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
        isDemo: { label: "Demo", type: "text" },
        demoProvider: { label: "Demo Provider", type: "text" },
        isGoogleToken: { label: "Google Token Auth", type: "text" },
        googleToken: { label: "Google JWT Token", type: "text" },
        isGoogleAuth: { label: "Google Auth", type: "text" },
        googleEmail: { label: "Google Email", type: "email" },
        googleName: { label: "Google Name", type: "text" },
        isAppleAuth: { label: "Apple Auth", type: "text" },
        appleEmail: { label: "Apple Email", type: "email" },
        appleName: { label: "Apple Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Asegurar que la base de datos esté sembrada
        seedInitialData();

        // 0. Autenticación con Google Identity Services (GIS SDK - JWT Token)
        if (credentials.isGoogleToken === "true" && credentials.googleToken) {
          const verified = verifyGoogleIdToken(credentials.googleToken);
          if (!verified || !verified.email) {
            throw new Error("Token de Google Identity Services inválido o no verificado.");
          }
          const user = createOrUpdateOAuthUser({
            email: verified.email.toLowerCase(),
            name: verified.name,
            image: verified.picture,
          });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image || undefined,
          };
        }

        // 1. Acceso Directo de Cuenta de Google
        if (credentials.isGoogleAuth === "true") {
          const email = (credentials.googleEmail || "usuario.google@gmail.com").trim().toLowerCase();
          const name = (credentials.googleName || "Usuario Google").trim();
          const user = createOrUpdateOAuthUser({
            email,
            name,
            image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image || undefined,
          };
        }

        // 2. Acceso Directo de Cuenta Apple ID
        if (credentials.isAppleAuth === "true") {
          const email = (credentials.appleEmail || "usuario.apple@icloud.com").trim().toLowerCase();
          const name = (credentials.appleName || "Usuario Apple ID").trim();
          const user = createOrUpdateOAuthUser({
            email,
            name,
          });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image || undefined,
          };
        }

        // 3. Login Estándar con Email y Contraseña (Seguridad de Producción)
        if (!credentials.email || !credentials.password) {
          throw new Error("Por favor ingresa tu correo y contraseña.");
        }

        let inputEmail = credentials.email.trim().toLowerCase();
        if (inputEmail === "admin" || inputEmail === "administrador" || inputEmail === "juanas89") {
          inputEmail = "juanas89@gmail.com";
        }

        // Acceso garantizado de Administrador Maestro en Serverless
        if (inputEmail === "juanas89@gmail.com" || inputEmail === "admin@aquiestamos.com") {
          if (credentials.password === "DjangoPY89") {
            try {
              seedInitialData();
            } catch (e) {}
            const existingAdmin = getUserByEmail(inputEmail);
            return {
              id: existingAdmin?.id || "usr_admin_master",
              name: existingAdmin?.name || "Administrador Juan",
              email: inputEmail,
              role: "ADMIN",
              image: existingAdmin?.image || undefined,
            };
          }
        }

        const user = getUserByEmail(inputEmail);
        if (!user || !user.passwordHash) {
          throw new Error("Credenciales inválidas. Por favor verifica tus datos.");
        }

        const isValid = bcrypt.compareSync(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Contraseña incorrecta. Por favor intenta de nuevo.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image || undefined,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        if (user.email) {
          const isMasterAdmin = user.email.toLowerCase() === "juanas89@gmail.com";
          const dbUser = createOrUpdateOAuthUser({
            email: user.email,
            name: user.name || "Usuario " + (account.provider === "google" ? "Google" : "Apple"),
            image: user.image || undefined,
          });
          user.id = dbUser.id;
          (user as any).role = isMasterAdmin ? "ADMIN" : dbUser.role;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
      } else if (token.email) {
        if (token.email.toLowerCase() === "juanas89@gmail.com" || token.email.toLowerCase() === "admin@aquiestamos.com") {
          token.role = "ADMIN";
        } else {
          const dbUser = getUserByEmail(token.email);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "CUSTOMER";
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET || "aquiestamos-super-secret-key-production-2026-xyz",
};
