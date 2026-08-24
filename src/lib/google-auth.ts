// Función utilitaria para decodificar y validar el JWT ID Token de Google Identity Services (GIS SDK)
export function verifyGoogleIdToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Formato de token JWT inválido.");
    }

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonPayload);

    // Validar emisor oficial de Google
    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      throw new Error("Emisor del token no reconocido.");
    }

    // Validar expiración
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("El token de Google ha expirado.");
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name || payload.given_name || payload.email.split("@")[0],
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (err: any) {
    console.error("Error verificando token de Google:", err);
    return null;
  }
}
