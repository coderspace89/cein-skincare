import React from "react";
import ProductHero from "@/app/components/pages/shop/product/ProductHero";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);

  return (
    <div>
      <ProductHero slug={slug} />
    </div>
  );
};

export default page;
