import React from "react";
import Hero from "@/app/components/pages/home/Hero";
import TextImageBlock from "@/app/components/pages/home/TextImageBlock";
import SliderOne from "@/app/components/pages/home/SliderOne";
import BannerBlock from "@/app/components/pages/home/BannerBlock";
import SliderTwo from "@/app/components/pages/home/SliderTwo";
import StatementBlock from "@/app/components/pages/home/StatementBlock";

const page = () => {
  return (
    <div>
      <Hero />
      <TextImageBlock />
      <SliderOne />
      <BannerBlock />
      <SliderTwo />
      <StatementBlock />
    </div>
  );
};

export default page;
