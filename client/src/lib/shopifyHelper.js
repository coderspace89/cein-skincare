// // src/lib/shopifyHelper.js
import { shopifyFetch } from "./shopify";

// Clean, valid Shopify Storefront API query structure
const GET_SINGLE_LOCALIZED_PRODUCT = `
  query getProductByHandle($handle: String!, $language: LanguageCode!, $country: CountryCode!)
  @inContext(language: $language, country: $country) {
    product(handle: $handle) {
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
            id # 1. 💡 CRITICAL: Fetch the variant's Global ID (gid://shopify/ProductVariant/...)
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

export async function getShopifyProductsByHandles(handlesArray, locale = "en") {
  let rawHandles = [];

  if (Array.isArray(handlesArray)) {
    rawHandles = handlesArray;
  } else if (typeof handlesArray === "string") {
    rawHandles = handlesArray.split(/[\s,]+/);
  } else if (handlesArray && typeof handlesArray === "object") {
    rawHandles = handlesArray.productHandles || Object.values(handlesArray);
  }

  if (!rawHandles || rawHandles.length === 0) return [];

  let languageCode = "EN";
  let countryCode = "US";

  if (locale.toLowerCase() === "es") {
    languageCode = "ES";
    countryCode = "ES";
  } else if (locale.toLowerCase() === "fr") {
    languageCode = "FR";
    countryCode = "FR";
  }

  const cleanHandles = rawHandles
    .map((item) => {
      const handleValue = typeof item === "string" ? item : item?.handle;
      return handleValue ? handleValue.replace(/['"]+/g, "").trim() : null;
    })
    .filter(Boolean);

  if (cleanHandles.length === 0) return [];

  try {
    const fetchPromises = cleanHandles.map(async (handle) => {
      const response = await shopifyFetch({
        query: GET_SINGLE_LOCALIZED_PRODUCT,
        variables: {
          handle,
          language: languageCode,
          country: countryCode,
        },
        locale: locale,
      });

      if (response?.errors || !response?.data?.product) {
        console.error(
          `Shopify item resolution failed for handle: ${handle}`,
          response?.errors,
        );
        return null;
      }

      const node = response.data.product;
      const firstVariantNode = node.variants?.edges[0]?.node || null; // Helper reference

      return {
        id: node.id,
        variantId: firstVariantNode?.id || null, // 2. 💡 EXPOSE: Pass this cleanly to your frontend slider mappings
        title: node.title,
        handle: node.handle,
        description: node.descriptionHtml,
        tags: node.tags || [],
        imageUrl: node.images?.edges[0]?.node?.url || null,
        imageAlt: node.images?.edges[0]?.node?.altText || node.title,
        price: firstVariantNode?.price?.amount || "0",
        currency: firstVariantNode?.price?.currencyCode || "USD",
      };
    });

    const resolvedProducts = await Promise.all(fetchPromises);
    return resolvedProducts.filter(Boolean);
  } catch (error) {
    console.error(
      `Error resolving handles matching loop sequence for locale ${locale}:`,
      error,
    );
    return [];
  }
}

const GET_LOCALIZED_VARIANTS = `
  query getVariants($ids: [ID!]!, $language: LanguageCode!, $country: CountryCode!) 
  @inContext(language: $language, country: $country) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        price {
          amount
          currencyCode
        }
        product {
          title
          descriptionHtml
        }
      }
    }
  }
`;

export async function getShopifyProductsByVariants(variantIds, locale = "en") {
  if (!variantIds || variantIds.length === 0) return [];

  let languageCode = "EN";
  let countryCode = "US";

  if (locale.toLowerCase() === "es") {
    languageCode = "ES";
    countryCode = "ES";
  } else if (locale.toLowerCase() === "fr") {
    languageCode = "FR";
    countryCode = "FR";
  }

  try {
    const response = await shopifyFetch({
      query: GET_LOCALIZED_VARIANTS,
      variables: {
        ids: variantIds,
        language: languageCode,
        country: countryCode,
      },
      locale: locale,
    });

    if (response?.errors || !response?.data?.nodes) {
      console.error("Shopify variant resolution failed:", response?.errors);
      return [];
    }

    return response.data.nodes
      .map((node) => {
        if (!node) return null;
        return {
          variantId: node.id,
          title: node.product?.title,
          description: node.product?.descriptionHtml,
          price: node.price?.amount || "0",
          currency: node.price?.currencyCode || "USD",
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error resolving variants:", error);
    return [];
  }
}
