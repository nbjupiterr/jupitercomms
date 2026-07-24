import type { Metadata } from "next";
import {
  PublicClientNotFound,
  PublicClientPageView,
  clientPageDescription,
  toPublicArtist,
} from "@/components/client/PublicClientPageView";
import { getPublicPageDataBySlug } from "@/lib/public-page-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { artist } = await getPublicPageDataBySlug(slug);
  const name = artist?.artist_name?.trim();
  const description = clientPageDescription(name);
  const title = "Orbit by Jupiter - Commission Tracker";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Orbit by Jupiter",
      images: [],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist, queue, gallery, socials } = await getPublicPageDataBySlug(slug);

  if (!artist) {
    return <PublicClientNotFound />;
  }

  return (
    <PublicClientPageView
      artist={toPublicArtist(artist)}
      gallery={gallery}
      socials={socials}
      queue={queue}
    />
  );
}
