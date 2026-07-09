import JournalDetails from "@/app/components/pages/journal/details-page/JournalDetails";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);
  return (
    <div>
      <JournalDetails slug={slug} />
    </div>
  );
};

export default page;
