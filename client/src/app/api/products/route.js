// src/app/api/products/route.js
import { NextResponse } from "next/server";
import {
  getShopifyProductsByHandles,
  getShopifyProductsByVariants,
} from "@/lib/shopifyHelper";

export async function POST(request) {
  try {
    const body = await request.json();
    const { productHandles, variantIds, locale } = body;

    // 1. Handle slider components querying by product handles
    if (productHandles && productHandles.length > 0) {
      console.log(
        "Processing Shopify query by productHandles:",
        productHandles,
      );
      const products = await getShopifyProductsByHandles(
        productHandles,
        locale,
      );
      return NextResponse.json(products);
    }

    // 2. Handle Cart page components querying by variant IDs
    if (variantIds && variantIds.length > 0) {
      console.log("Processing Shopify query by variantIds:", variantIds);
      const products = await getShopifyProductsByVariants(variantIds, locale);
      return NextResponse.json(products);
    }

    // 3. Fallback if neither property is supplied in the request body
    return NextResponse.json(
      {
        error:
          "Invalid payload. Provide either 'productHandles' or 'variantIds'.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
