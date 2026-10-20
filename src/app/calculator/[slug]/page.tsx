import { redirect } from "next/navigation";
import { getLiveCalculatorMeta } from "@/lib/calculators/registry-data";
import { calculatorNameToSeoSlug } from "@/lib/calculators/seo-urls";

export function generateStaticParams() {
  // We don't pre-generate — we redirect everything
  return [];
}

export default async function OldCalculatorRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getLiveCalculatorMeta(slug);
  if (meta) {
    const seoSlug = calculatorNameToSeoSlug(meta.name);
    redirect(`/${seoSlug}`);
  }
  redirect("/");
}
