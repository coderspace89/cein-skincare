// src/lib/shopify.js

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch({ query, variables }) {
  // Hard default if env fails, but template literal handles it
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store", // Prevents dev-mode locale caching issues
    });

    return res.json();
  } catch (error) {
    console.error("Shopify Network Fetch Error:", error);
    return { errors: [{ message: error.message }] };
  }
}
