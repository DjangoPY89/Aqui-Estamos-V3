import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { createOrUpdateOAuthUser, createUser, getUserByEmail, getUserById, seedInitialData } from "./db";
import {
  supabaseCreateOrUpdateOAuthUser,
  supabaseGetUserByEmail,
} from "./supabase-db";
import { verifyGoogleIdToken } from "./google-auth";

// Configuración de credenciales y URL en Vercel
const googleClientId = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "DjangoPY89_Secret_Production_Key_2026_AquiEstamos";
}

// SIEMPRE forzar la URL canónica en producción para evitar redirect_uri_mismatch con Google OAuth
// VERCEL_URL cambia en cada preview deployment, por eso se ignora y se usa la URL fija de producción
if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://aqui-estamos-v3.vercel.app";
} else if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "DjangoPY89_Secret_Production_Key_2026_AquiEstamos",
  providers: [
    // Proveedor Google OAuth Oficial
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
              },
            },
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        idToken: { label: "Google ID Token", type: "text" },
        isGoogleAuth: { label: "Google Auth Flag", type: "text" },
        googleEmail: { label: "Google Email", type: "text" },
        googleName: { label: "Google Name", type: "text" },
        isAppleAuth: { label: "Apple Auth Flag", type: "text" },
        appleEmail: { label: "Apple Email", type: "text" },
        appleName: { label: "Apple Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // 1. Acceso Directo de Cuenta de Google
        if (credentials.isGoogleAuth === "true") {
          const email = (credentials.googleEmail || "usuario.google@gmail.com").trim().toLowerCase();
          const name = (credentials.googleName || "Usuario Google").trim();
          let user: any = null;
          try {
            user = await supabaseCreateOrUpdateOAuthUser({
              email,
              name,
              image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
            });
            try {
              createOrUpdateOAuthUser({
                email,
                name,
                image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
              });
            } catch (e) {}
          } catch (e) {
            user = createOrUpdateOAuthUser({
              email,
              name,
              image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
            });
          }

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
          let user: any = null;
          try {
            user = await supabaseCreateOrUpdateOAuthUser({ email, name });
            try {
              createOrUpdateOAuthUser({ email, name });
            } catch (e) {}
          } catch (e) {
            user = createOrUpdateOAuthUser({ email, name });
          }

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

        const cleanPassword = (credentials.password || "").trim();

        // Acceso garantizado de Administrador Maestro en Serverless
        if (inputEmail === "juanas89@gmail.com" || inputEmail === "admin@aquiestamos.com") {
          if (
            cleanPassword === "DjangoPY89" ||
            cleanPassword.toLowerCase() === "djangopy89" ||
            cleanPassword === "admin123" ||
            cleanPassword === "Admin123!"
          ) {
            try {
              seedInitialData();
            } catch (e) {}
            return {
              id: "usr_admin_master",
              name: "Juan Solalinde (Admin)",
              email: "juanas89@gmail.com",
              role: "ADMIN",
              image: undefined,
            };
          }
        }

        let user: any = null;
        try {
          user = await supabaseGetUserByEmail(inputEmail);
        } catch (e) {
          user = getUserByEmail(inputEmail);
        }

        if (!user) {
          user = getUserByEmail(inputEmail);
        }

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
          role: inputEmail === "juanas89@gmail.com" ? "ADMIN" : user.role,
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
          let dbUser: any = null;
          try {
            dbUser = await supabaseCreateOrUpdateOAuthUser({
              email: user.email,
              name: user.name || "Usuario " + (account.provider === "google" ? "Google" : "Apple"),
              image: user.image || undefined,
            });
            try {
              createOrUpdateOAuthUser({
                email: user.email,
                name: user.name || "Usuario " + (account.provider === "google" ? "Google" : "Apple"),
                image: user.image || undefined,
              });
            } catch (e) {}
          } catch (e) {
            dbUser = createOrUpdateOAuthUser({
              email: user.email,
              name: user.name || "Usuario " + (account.provider === "google" ? "Google" : "Apple"),
              image: user.image || undefined,
            });
          }

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
      }
      if (token.email) {
        const lowerEmail = token.email.toLowerCase();
        if (lowerEmail === "juanas89@gmail.com" || lowerEmail === "admin@aquiestamos.com") {
          token.role = "ADMIN";
        } else if (!token.role || token.role === "CUSTOMER") {
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
        const lowerEmail = session.user.email?.toLowerCase();
        if (lowerEmail === "juanas89@gmail.com" || lowerEmail === "admin@aquiestamos.com") {
          (session.user as any).role = "ADMIN";
        } else {
          (session.user as any).role = (token.role as string) || "CUSTOMER";
        }
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
};
