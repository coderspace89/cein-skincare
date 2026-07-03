import { NextResponse } from "next/server";
import crypto from "crypto";

// Security helpers for PKCE strings
const generateRandomString = () => crypto.randomBytes(32).toString("hex");
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest();
const base64UrlEncode = (str) =>
  str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const emailHint = searchParams.get("email") || ""; // Prefills the user's input

  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN; // e.g. cein-skincare-kuswhjti.myshopify.com
  const clientId = process.env.SHOPIFY_CLIENT_ID; // Your Client ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`;

  // 1. Generate PKCE values to prevent interception attacks
  const state = generateRandomString();
  const nonce = generateRandomString();
  const codeVerifier = generateRandomString();
  const codeChallenge = base64UrlEncode(sha256(Buffer.from(codeVerifier)));

  // 2. Format Shopify authorization url endpoints
  const authUrl = new URL(
    `https://shopify.com/authentication/73517301829/oauth/authorize`,
  );
  authUrl.searchParams.append("client_id", clientId);
  // 💡 CHANGE THIS LINE IN YOUR /api/auth/login/route.js:
  authUrl.searchParams.append(
    "scope",
    "openid email customer-account-api:full",
  );
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("nonce", nonce);
  authUrl.searchParams.append("code_challenge", codeChallenge);
  authUrl.searchParams.append("code_challenge_method", "S256");

  if (emailHint) {
    authUrl.searchParams.append("login_hint", emailHint);
  }

  // 3. Keep verification hashes in cookies to validate during callback
  const response = NextResponse.redirect(authUrl.toString());

  const cookieOptions = "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900"; // 15 mins
  response.headers.append(
    "Set-Cookie",
    `auth_state=${state}; ${cookieOptions}`,
  );
  response.headers.append(
    "Set-Cookie",
    `auth_code_verifier=${codeVerifier}; ${cookieOptions}`,
  );

  return response;
}
