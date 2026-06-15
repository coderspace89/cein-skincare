// src/lib/shopify.js

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch({ query, variables, locale = "en" }) {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        // 1. Send the active language to Shopify to translate text fields automatically
        "Accept-Language": locale.toLowerCase(),
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Shopify Network Fetch Error:", error);
    return { errors: [{ message: error.message }] };
  }
}
