import React from "react";
import TextImageBlock from "@/app/components/pages/about-us/TextImageBlock";
import ImageBanner from "@/app/components/pages/about-us/ImageBanner";
import TextBanner from "@/app/components/pages/about-us/TextBanner";
import CardsBlock from "@/app/components/pages/about-us/CardsBlock";

const page = () => {
  return (
    <div>
      <TextImageBlock />
      <ImageBanner />
      <TextBanner />
      <CardsBlock />
    </div>
  );
};

export default page;
