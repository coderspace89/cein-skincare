import { NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const LOCALE_SETTINGS = {
  en: { language: "EN", country: "US" },
  es: { language: "ES", country: "ES" },
  fr: { language: "FR", country: "FR" },
};

export async function POST(request) {
  try {
    const { lines, locale = "en" } = await request.json();
    const activeSettings =
      LOCALE_SETTINGS[locale.toLowerCase()] || LOCALE_SETTINGS.en;

    // Mutation to initialize a checkout cart session with explicit items
    const cartCreateMutation = `
      mutation cartCreate($input: CartInput!, $language: LanguageCode!, $country: CountryCode!)
      @inContext(language: $language, country: $country) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Map your client-side cart items to standard Shopify CartLineInput formats
    const shopifyLines = lines.map((item) => ({
      merchandiseId: item.variantId,
      quantity: parseInt(item.quantity, 10) || 1,
    }));

    // 💡 1. Updated API version to match your storefront helper configuration rules
    const response = await fetch(`https://${domain}/api/2024-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        // 💡 2. CRITICAL HEADERS: Forces the returned checkout link to use the target market's currency (EUR) and language
        "Accept-Language": locale.toLowerCase(),
        "X-Shopify-Storefront-Country": activeSettings.country,
      },
      body: JSON.stringify({
        query: cartCreateMutation,
        variables: {
          input: { lines: shopifyLines },
          language: activeSettings.language,
          country: activeSettings.country,
        },
      }),
    });

    const json = await response.json();

    if (json.errors || json.data?.cartCreate?.userErrors?.length > 0) {
      console.error(
        "Shopify Cart Processing Failure:",
        json.errors || json.data.cartCreate.userErrors,
      );
      return NextResponse.json(
        { error: "Could not create checkout link" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      checkoutUrl: json.data.cartCreate.cart.checkoutUrl,
    });
  } catch (error) {
    console.error("Cart API Route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
