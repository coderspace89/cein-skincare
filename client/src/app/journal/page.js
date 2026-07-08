import React from "react";
import JournalHero from "@/app/components/pages/journal/JournalHero";
import BlogSlider from "@/app/components/pages/home/BlogSlider";
import FeaturedArticle from "@/app/components/pages/journal/FeaturedArticle";
import FeaturedArticleTwo from "@/app/components/pages/journal/FeaturedArticleTwo";

const page = () => {
  return (
    <div>
      <JournalHero />
      <BlogSlider />
      <FeaturedArticle />
      <BlogSlider />
      <FeaturedArticleTwo />
    </div>
  );
};

export default page;
