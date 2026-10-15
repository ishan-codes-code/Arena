import { GameDetailsView } from "@/modules/console-games/ui/views/game-details-view";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ConsoleGameDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  return <GameDetailsView slug={slug} />;
}
