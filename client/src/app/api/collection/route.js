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
  const handle = searchParams.get("handle");
  const clientLocale = searchParams.get("locale") || "en";

  if (!handle) {
    return NextResponse.json(
      { error: "Missing collection handle parameter" },
      { status: 400 },
    );
  }

  const activeSettings =
    LOCALE_SETTINGS[clientLocale.toLowerCase()] || LOCALE_SETTINGS.en;

  // 💡 FIX 1: Added "id" inside the variant node query block
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
                id 
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

    const mappedProducts = rawProducts.map((item) => {
      const firstImage = item.images?.nodes?.[0]?.url || null;
      const firstVariant = item.variants?.nodes?.[0];

      return {
        id: item.id,
        // 💡 FIX 2: Explicitly append the unique variant ID to the response item
        variantId: firstVariant?.id || null,
        title: item.title,
        desc: item.descriptionHtml || "",
        category: item.productType || "Other",
        tags: item.tags || [],
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
