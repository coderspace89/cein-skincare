import React from "react";
import Hero from "@/app/components/pages/home/Hero";
import TextImageBlock from "@/app/components/pages/home/TextImageBlock";
import SliderOne from "@/app/components/pages/home/SliderOne";

const page = () => {
  return (
    <div>
      <Hero />
      <TextImageBlock />
      <SliderOne />
    </div>
  );
};

export default page;
