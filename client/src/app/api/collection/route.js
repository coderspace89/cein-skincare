import { NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Localized mapping configurations matching your target regional store setups
const LOCALE_SETTINGS = {
  en: { language: "EN", country: "US" },
  es: { language: "ES", country: "ES" },
  fr: { language: "FR", country: "FR" },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle"); // The master English collection handle (e.g., 'skin-care')
  const clientLocale = searchParams.get("locale") || "en";

  if (!handle) {
    return NextResponse.json(
      { error: "Missing collection handle parameter" },
      { status: 400 },
    );
  }

  const activeSettings =
    LOCALE_SETTINGS[clientLocale.toLowerCase()] || LOCALE_SETTINGS.en;

  // GraphQL query designed to pull items inside a specific target collection handle context
  const collectionProductsQuery = `
    query getCollectionProducts($handle: String!, $language: LanguageCode!, $country: CountryCode!) 
    @inContext(language: $language, country: $country) {
      collection(handle: $handle) {
        products(first: 50) {
          nodes {
            id
            title
            descriptionHtml
            handle
            productType
            tags
            images(first: 1) {
              nodes { url }
            }
            variants(first: 1) {
              nodes {
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const shopifyResponse = await fetch(
      `https://${domain}/api/2024-04/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
        body: JSON.stringify({
          query: collectionProductsQuery,
          variables: {
            handle: handle,
            language: activeSettings.language,
            country: activeSettings.country,
          },
        }),
      },
    );

    if (!shopifyResponse.ok) {
      throw new Error(
        `Shopify storefront error connection status: ${shopifyResponse.status}`,
      );
    }

    const json = await shopifyResponse.json();

    if (json.errors) {
      console.error("Shopify GraphQL Errors:", json.errors);
      return NextResponse.json(
        { error: "GraphQL resolution error payload" },
        { status: 500 },
      );
    }

    const rawProducts = json?.data?.collection?.products?.nodes || [];

    // Normalize and clean up variables for immediate frontend consumption
    const mappedProducts = rawProducts.map((item) => {
      const firstImage = item.images?.nodes?.[0]?.url || null;
      const firstVariant = item.variants?.nodes?.[0];

      return {
        id: item.id,
        title: item.title, // Translated natively by Shopify
        desc: item.descriptionHtml || "", // Translated natively by Shopify
        category: item.productType || "Other", // Maps to the standard Shopify Category column
        tags: item.tags || [], // Kept in English for clean filtering logic
        price: firstVariant?.price
          ? new Intl.NumberFormat(clientLocale, {
              style: "currency",
              currency: firstVariant.price.currencyCode,
            }).format(Math.round(firstVariant.price.amount))
          : "$0.00",
        img: firstImage,
        handle: item.handle,
      };
    });

    return NextResponse.json({ products: mappedProducts }, { status: 200 });
  } catch (error) {
    console.error("Collection Proxy Route breakdown:", error);
    return NextResponse.json(
      { error: "Internal Server Collection Error" },
      { status: 500 },
    );
  }
}
