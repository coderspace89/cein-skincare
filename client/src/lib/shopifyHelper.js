// lib/shopifyHelper.js
import { shopifyFetch } from "./shopify";

export async function getShopifyProductsByHandles(handlesArray, locale = "en") {
  if (!handlesArray || handlesArray.length === 0) return [];

  // 1. Determine contextual market parameters
  let languageCode = "EN";
  let countryCode = "US";

  if (locale.toLowerCase() === "es") {
    languageCode = "ES";
    countryCode = "ES"; // Matches Spain Market
  } else if (locale.toLowerCase() === "fr") {
    languageCode = "FR";
    countryCode = "FR"; // Matches France Market
  }

  // 2. Format handles
  const queryParts = handlesArray
    .map((item) => {
      const handleValue = typeof item === "string" ? item : item?.handle;
      return handleValue ? `handle:${handleValue}` : null;
    })
    .filter(Boolean);

  if (queryParts.length === 0) return [];
  const searchQuery = queryParts.join(" OR ");

  // Standard clean query without complex variable configurations
  const GET_PRODUCTS_QUERY = `
    query getProducts($searchQuery: String!) {
      products(first: 10, query: $searchQuery) {
        edges {
          node {
            id
            title
            handle
            description
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
    // 3. Execute with explicit header triggers passed down
    const response = await shopifyFetch({
      query: GET_PRODUCTS_QUERY,
      variables: { searchQuery },
      language: languageCode, // 👈 Triggers header rules
      country: countryCode, // 👈 Triggers header rules
    });

    if (response?.errors) {
      console.error("Shopify execution errors:", response.errors);
      return [];
    }

    const edges = response?.data?.products?.edges || [];

    return edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      imageUrl: node.images?.edges[0]?.node?.url || null,
      imageAlt: node.images?.edges[0]?.node?.altText || node.title,
      price: node.variants?.edges[0]?.node?.price?.amount || "0",
      currency: node.variants?.edges[0]?.node?.price?.currencyCode || "USD",
    }));
  } catch (error) {
    console.error(`Fetch failure for locale: ${locale}`, error);
    return [];
  }
}
