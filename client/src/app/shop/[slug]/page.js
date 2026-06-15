import React from "react";
import ProductListings from "@/app/components/pages/shop/ProductListings";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);
  return (
    <div>
      <ProductListings slug={slug} />
    </div>
  );
};

export default page;
