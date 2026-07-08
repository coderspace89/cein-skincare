import React from "react";

const page = async ({ params }) => {
  const { slug } = await params;
  console.log(slug);
  return <div>page</div>;
};

export default page;
