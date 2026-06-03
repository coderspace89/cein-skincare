// src/lib/shopifyHelper.js
import { shopifyFetch } from "./shopify";

export async function getShopifyProductsByHandles(handlesArray, locale = "en") {
  // 1. Defensively capture and ensure handlesArray is actually a flat array
  let rawHandles = [];

  if (Array.isArray(handlesArray)) {
    rawHandles = handlesArray;
  } else if (typeof handlesArray === "string") {
    // If a comma-separated or space-separated string slipped in, clean split it
    rawHandles = handlesArray.split(/[\s,]+/);
  } else if (handlesArray && typeof handlesArray === "object") {
    // If the entire req.body object accidentally got passed in directly
    rawHandles = handlesArray.productHandles || Object.values(handlesArray);
  }

  if (!rawHandles || rawHandles.length === 0) return [];

  // 2. Map frontend locales to Shopify Market configurations
  let languageCode = "EN";
  let countryCode = "US";

  if (locale.toLowerCase() === "es") {
    languageCode = "ES";
    countryCode = "ES";
  } else if (locale.toLowerCase() === "fr") {
    languageCode = "FR";
    countryCode = "FR";
  }

  // 3. Clean handles and join with strict uppercase Boolean OR (No commas!)
  const queryParts = rawHandles
    .map((item) => {
      const handleValue = typeof item === "string" ? item : item?.handle;
      // Strip out any stray quotation marks or spaces from payload injection
      return handleValue
        ? `handle:${handleValue.replace(/['"]+/g, "").trim()}`
        : null;
    })
    .filter(Boolean);

  if (queryParts.length === 0) return [];

  // Joins as: "handle:lucent-facial-concentrate OR handle:cellular-protection-hand-cream"
  const searchQuery = queryParts.join(" OR ");

  // 4. Define query with explicit context directives
  const GET_LOCALIZED_PRODUCTS = `
    query getProducts($searchQuery: String!, $language: LanguageCode!, $country: CountryCode!) 
    @inContext(language: $language, country: $country) {
      products(first: 10, query: $searchQuery) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            tags
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
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
    }
  `;

  try {
    const response = await shopifyFetch({
      query: GET_LOCALIZED_PRODUCTS,
      variables: {
        searchQuery,
        language: languageCode,
        country: countryCode,
      },
      locale: locale,
    });

    if (response?.errors) {
      console.error(
        `Shopify API errors for locale ${locale}:`,
        response.errors,
      );
      return [];
    }

    const edges = response?.data?.products?.edges || [];

    return edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.descriptionHtml,
      tags: node.tags || [],
      imageUrl: node.images?.edges[0]?.node?.url || null,
      imageAlt: node.images?.edges[0]?.node?.altText || node.title,
      price: node.variants?.edges[0]?.node?.price?.amount || "0",
      currency: node.variants?.edges[0]?.node?.price?.currencyCode || "USD",
    }));
  } catch (error) {
    console.error(
      `Error mapping localized products loop for locale ${locale}:`,
      error,
    );
    return [];
  }
}
