import { NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const SHOPIFY_GRAPHQL_QUERY = `
 query getProductDetail($handle: String!, $language: LanguageCode!, $country: CountryCode!) 
 @inContext(language: $language, country: $country) {
  product(handle: $handle) {
    id
    title
    handle
    descriptionHtml
    productType
    
    # This automatically updates based on the @inContext country
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }

    category {
      id
      name
    }

    categoryMetafields: metafields(
      identifiers: [
        { namespace: "shopify", key: "material" },
        { namespace: "shopify", key: "active-ingredient" },
        { namespace: "shopify", key: "age-group" },
        { namespace: "shopify", key: "suitable-for-skin-type" },
        { namespace: "shopify", key: "skin-care-features" }
      ]
    ) {
      id
      namespace
      key
      value
      type
      references(first: 5) {
        nodes {
          ... on Metaobject {
            id
            handle
            fields {
              key
              value
            }
          }
        }
      }
    }

    images(first: 5) {
      nodes {
        url
        altText
      }
    }
    
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        # Standard price field handles localization automatically via @inContext 
        price {
          amount
          currencyCode
        }
      }
    }
  }
}
`;

export async function GET(request) {
  try {
    // 1. Extract query params from the URL request
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const language = searchParams.get("language") || "EN"; // fallback default
    const country = searchParams.get("country") || "US"; // fallback default

    if (!handle) {
      return NextResponse.json(
        { error: "Missing required 'handle' query parameter" },
        { status: 400 },
      );
    }

    // 2. Fire the query request off to the Shopify Storefront API
    const response = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({
        query: SHOPIFY_GRAPHQL_QUERY,
        variables: {
          handle: handle,
          language: language.toUpperCase(),
          country: country.toUpperCase(),
        },
      }),
      // Keeps data fast but fresh
      //   next: { revalidate: 60 },
      // Change this temporarily from revalidate to 0 (no cache)
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Shopify API responded with status: ${response.status}`);
    }

    const { data, errors } = await response.json();

    if (errors) {
      console.error("Shopify GraphQL Errors:", errors);
      return NextResponse.json(
        { error: "GraphQL errors returned from Shopify", details: errors },
        { status: 500 },
      );
    }

    if (!data?.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 3. Return the product data payload directly
    return NextResponse.json(data.product);
  } catch (error) {
    console.error("Shopify Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
