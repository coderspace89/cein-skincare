import BlogSlider from "@/app/components/pages/home/BlogSlider";
import JournalDetails from "@/app/components/pages/journal/details-page/JournalDetails";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);
  return (
    <div>
      <JournalDetails slug={slug} />
      <BlogSlider />
    </div>
  );
};

export default page;
