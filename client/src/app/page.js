import React from "react";
import Hero from "@/app/components/pages/home/Hero";
import TextImageBlock from "@/app/components/pages/home/TextImageBlock";
import SliderOne from "@/app/components/pages/home/SliderOne";
import BannerBlock from "@/app/components/pages/home/BannerBlock";
import SliderTwo from "@/app/components/pages/home/SliderTwo";
import StatementBlock from "@/app/components/pages/home/StatementBlock";
import UserVoiceGallery from "@/app/components/pages/home/UserVoiceGallery";
import BlogSlider from "@/app/components/pages/home/BlogSlider";

const page = () => {
  return (
    <div>
      <Hero />
      <TextImageBlock />
      <SliderOne />
      <BannerBlock />
      <SliderTwo />
      <StatementBlock />
      <UserVoiceGallery />
      <BlogSlider />
    </div>
  );
};

export default page;
