// // src/lib/shopify.js

// const domain = process.env.SHOPIFY_STORE_DOMAIN;
// const storefrontAccessToken =
//   process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// export async function shopifyFetch({ query, variables, locale = "en" }) {
//   const endpoint = `https://${domain}/api/2024-01/graphql.json`;

//   try {
//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
//         // 1. Send the active language to Shopify to translate text fields automatically
//         "Accept-Language": locale.toLowerCase(),
//       },
//       body: JSON.stringify({ query, variables }),
//       cache: "no-store",
//     });

//     return res.json();
//   } catch (error) {
//     console.error("Shopify Network Fetch Error:", error);
//     return { errors: [{ message: error.message }] };
//   }
// }

// src/lib/shopify.js

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch({ query, variables, locale = "en" }) {
  // 1. Updated API version to support modern market localization context rules
  const endpoint = `https://${domain}/api/2024-07/graphql.json`;

  // 2. Map dynamic incoming locale string to the respective country code configuration rules
  let countryHeaderCode = "US";
  const currentLocale = locale.toLowerCase();

  if (currentLocale === "es") {
    countryHeaderCode = "ES";
  } else if (currentLocale === "fr") {
    countryHeaderCode = "FR";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        "Accept-Language": currentLocale,
        // 3. CRITICAL HEADER: Overrides the store base profile routing defaults
        // to return the proper currency amounts configured for Spain and France
        "X-Shopify-Storefront-Country": countryHeaderCode,
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
