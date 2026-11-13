import { container } from "@/features/container";
import { AuctionDetailView } from "@/features/auctions/ui/auction-detail-view";
import { notFound } from "next/navigation";

export interface AuctionPageProps {
  params: Promise<{ id: string }>;
}

export default async function AuctionPage({ params }: AuctionPageProps) {
  const { id } = await params;

  let auction = null;
  try {
    auction = await container.auctionService.getAuctionById(id);
  } catch {
    notFound();
  }

  if (auction === null) {
    notFound();
  }

  return <AuctionDetailView auction={auction} />;
}
