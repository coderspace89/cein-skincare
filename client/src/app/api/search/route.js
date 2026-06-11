import { NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const LOCALE_SETTINGS = {
  en: { language: "EN", country: "US" },
  es: { language: "ES", country: "ES" },
  fr: { language: "FR", country: "FR" },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const clientLocale = searchParams.get("locale") || "en";

  if (!query) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  const activeSettings =
    LOCALE_SETTINGS[clientLocale.toLowerCase()] || LOCALE_SETTINGS.en;

  const predictiveSearchQuery = `
    query getPredictiveSearchResults($query: String!, $language: LanguageCode!, $country: CountryCode!) 
    @inContext(language: $language, country: $country) {
      predictiveSearch(query: $query, types: [PRODUCT], limit: 4) {
        products {
          id
          title
          descriptionHtml
            tags
          handle
          images(first: 1) {
            nodes { url }
          }
          variants(first: 1) {
            nodes {
              price {
                amount
                currencyCode
              }
              selectedOptions { name value }
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
          query: predictiveSearchQuery,
          variables: {
            query: query,
            language: activeSettings.language, // <-- FIX: Pass just the string (e.g., "EN")
            country: activeSettings.country, // <-- FIX: Pass the required country code string (e.g., "US")
          },
        }),
      },
    );

    if (!shopifyResponse.ok) {
      throw new Error(
        `Shopify API responded with status ${shopifyResponse.status}`,
      );
    }

    const json = await shopifyResponse.json();

    // Debugging safety net: if Shopify returns a GraphQL error, log it to your server console
    if (json.errors) {
      console.error("Shopify GraphQL errors:", json.errors);
    }

    const rawProducts = json?.data?.predictiveSearch?.products || [];

    const mappedProducts = rawProducts.map((item) => {
      const firstImage = item.images?.nodes?.[0]?.url || null;
      const firstVariant = item.variants?.nodes?.[0];

      return {
        id: item.id,
        title: item.title,
        desc: item.descriptionHtml,
        tags: item.tags || [],
        price: firstVariant?.price
          ? new Intl.NumberFormat(clientLocale, {
              style: "currency",
              currency: firstVariant.price.currencyCode,
            }).format(Math.round(firstVariant.price.amount))
          : "$0.00",
        img: firstImage,
        handle: item.handle,
        badge: null,
      };
    });

    return NextResponse.json({ products: mappedProducts }, { status: 200 });
  } catch (error) {
    console.error("Shopify Proxy Route failure:", error);
    return NextResponse.json(
      { error: "Internal Server Search Error" },
      { status: 500 },
    );
  }
}
