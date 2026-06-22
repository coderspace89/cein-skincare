import React from "react";
import ProductHero from "@/app/components/pages/shop/product/ProductHero";
import RoutineBlock from "@/app/components/pages/shop/product/RoutineBlock";
import BenefitsBlock from "@/app/components/pages/shop/product/BenefitsBlock";
import ReviewsBlock from "@/app/components/pages/shop/product/ReviewsBlock";
import SuggestedProducts from "@/app/components/pages/shop/product/SuggestedProducts";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);

  return (
    <div>
      <ProductHero slug={slug} />
      <RoutineBlock slug={slug} />
      <BenefitsBlock slug={slug} />
      <ReviewsBlock slug={slug} />
      <SuggestedProducts slug={slug} />
    </div>
  );
};

export default page;
