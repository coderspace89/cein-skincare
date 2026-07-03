import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // 1. Retrieve the parameters stored inside your authorization route cookies
  const cookieStore = await cookies();
  const savedState = cookieStore.get("auth_state")?.value;
  const codeVerifier = cookieStore.get("auth_code_verifier")?.value;

  // CSRF verification check
  if (!code || !state || state !== savedState) {
    return new NextResponse("Security state mismatch or missing auth code.", {
      status: 400,
    });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const cleanRedirectUri = `${baseUrl}/api/auth/callback`;

  // 2. Build out the body parameters exactly as standard URLSearchParams
  const bodyParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: cleanRedirectUri,
    code: code,
    code_verifier: codeVerifier, // Raw string verifier used to sign the challenge
  });

  try {
    // 3. Post parameters directly without any basic auth header wrapper
    const tokenResponse = await fetch(
      `https://shopify.com/authentication/73517301829/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Shopify Token Exchange Error:", tokenData);
      return new NextResponse(
        tokenData.error_description || "Failed exchanging token credentials",
        { status: tokenResponse.status },
      );
    }

    // Success! You now have your id_token and access_token.
    // Save tokens inside session cookies or database here, then redirect home.
    const response = NextResponse.redirect(new URL("/", baseUrl));

    // Clear temporary auth tracking cookies
    response.cookies.delete("auth_state");
    response.cookies.delete("auth_code_verifier");

    return response;
  } catch (error) {
    console.error("Auth Callback Crash:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
