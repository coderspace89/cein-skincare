import React from "react";
import ProductListings from "@/app/components/pages/shop/ProductListings";
import BlogSlider from "@/app/components/pages/home/BlogSlider";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);
  return (
    <div>
      <ProductListings slug={slug} />
      <BlogSlider />
    </div>
  );
};

export default page;
