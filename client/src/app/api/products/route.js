// src/app/api/shopify-products/route.js
import { NextResponse } from "next/server";
import { getShopifyProductsByHandles } from "@/lib/shopifyHelper";

export async function POST(request) {
  try {
    const body = await request.json();
    const { productHandles, locale } = body; // 👈 Make sure 'locale' is destructured here!

    // Pass BOTH variables to your helper function
    const products = await getShopifyProductsByHandles(productHandles, locale);

    return NextResponse.json(products);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
