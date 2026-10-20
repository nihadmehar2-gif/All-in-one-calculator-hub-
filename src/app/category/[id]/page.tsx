import { redirect } from "next/navigation";
import { getCategoryData } from "@/lib/calculators/categories-data";
import { categoryUrlPath } from "@/lib/calculators/seo-urls";

export function generateStaticParams() {
  return [];
}

export default async function OldCategoryRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cat = getCategoryData(id);
  if (cat) {
    const catSeo = categoryUrlPath(cat.id, cat.name).slice(1);
    redirect(`/${catSeo}`);
  }
  redirect("/");
}
