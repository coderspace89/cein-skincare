import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Read verification cookies
  const cookies = request.cookies;
  const savedState = cookies.get("auth_state")?.value;
  const codeVerifier = cookies.get("auth_code_verifier")?.value;

  // CSRF validation check
  if (!state || state !== savedState) {
    return NextResponse.json(
      { error: "Security state mismatch / CSRF alert" },
      { status: 400 },
    );
  }

  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`;

  try {
    // Exchange token payload mapping
    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code,
      code_verifier: codeVerifier,
    });

    // Request Shopify access tokens
    const tokenResponse = await fetch(
      `https://shopify.com/authentication/73517301829/oauth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyParams.toString(),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(
        tokenData.error_description || "Failed exchanging token credentials",
      );
    }

    // 💡 TOKENS RECEIVED: access_token, refresh_token, id_token
    const { access_token, expires_in } = tokenData;

    // Save access token securely into an HTTP-Only cookie for application query requests
    const targetDashboardUrl = new URL("/", request.url);
    const finalResponse = NextResponse.redirect(targetDashboardUrl.toString());

    finalResponse.headers.append(
      "Set-Cookie",
      `customer_token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${expires_in}`,
    );

    // Clean up temporary authorization tracking cookies
    finalResponse.headers.append(
      "Set-Cookie",
      "auth_state=; Path=/; Max-Age=0",
    );
    finalResponse.headers.append(
      "Set-Cookie",
      "auth_code_verifier=; Path=/; Max-Age=0",
    );

    return finalResponse;
  } catch (error) {
    console.error("OAuth callback breakdown:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
