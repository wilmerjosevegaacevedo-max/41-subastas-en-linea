import type { AuctionDetail, AuctionSortCriteria } from "../schema";

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterAuctions(auctions: AuctionDetail[], rawQuery: string): AuctionDetail[] {
  const query = normalizeText(rawQuery);
  if (query.length === 0) {
    return auctions;
  }

  const results: AuctionDetail[] = [];
  for (const auction of auctions) {
    const titleMatch = normalizeText(auction.titulo).includes(query);
    const descMatch = normalizeText(auction.descripcion).includes(query);
    if (titleMatch || descMatch) {
      results.push(auction);
    }
  }

  return results;
}

export function sortAuctions(auctions: AuctionDetail[], criteria: AuctionSortCriteria): AuctionDetail[] {
  const copy = [...auctions];

  if (criteria === "menor_precio") {
    copy.sort((a, b) => {
      return a.puja_actual_centavos - b.puja_actual_centavos;
    });
    return copy;
  }

  if (criteria === "mayor_precio") {
    copy.sort((a, b) => {
      return b.puja_actual_centavos - a.puja_actual_centavos;
    });
    return copy;
  }

  // Por defecto "cierre_proximo"
  copy.sort((a, b) => {
    const timeA = new Date(a.cierra_en).getTime();
    const timeB = new Date(b.cierra_en).getTime();
    return timeA - timeB;
  });

  return copy;
}
