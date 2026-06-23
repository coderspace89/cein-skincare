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
    const { ids, locale = "en" } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const activeSettings =
      LOCALE_SETTINGS[locale.toLowerCase()] || LOCALE_SETTINGS.en;

    // Use the optimized 'nodes' field query to grab all explicit matching IDs at once
    const favoritesQuery = `
      query getFavoritesByIds($ids: [ID!]!, $language: LanguageCode!, $country: CountryCode!) 
      @inContext(language: $language, country: $country) {
        nodes(ids: $ids) {
          ... on Product {
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
    `;

    const shopifyResponse = await fetch(
      `https://${domain}/api/2024-04/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
        body: JSON.stringify({
          query: favoritesQuery,
          variables: {
            ids: ids,
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
      console.error("Shopify Favorites GraphQL Errors:", json.errors);
      return NextResponse.json(
        { error: "GraphQL lookup error" },
        { status: 500 },
      );
    }

    // Filter out null elements in case a stored product ID was removed or unpublished on Shopify
    const rawProducts = (json?.data?.nodes || []).filter(Boolean);

    const mappedProducts = rawProducts.map((item) => {
      const firstImage = item.images?.nodes?.[0]?.url || null;
      const firstVariant = item.variants?.nodes?.[0];

      return {
        id: item.id,
        title: item.title,
        desc: item.descriptionHtml || "",
        category: item.productType || "Other",
        tags: item.tags || [],
        price: firstVariant?.price
          ? new Intl.NumberFormat(locale, {
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
    console.error("Favorites Proxy Route breakdown:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
