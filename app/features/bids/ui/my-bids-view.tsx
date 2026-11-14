"use client";

import { useState } from "react";
import type { BidTabFilter, UserBidSummary } from "../schema";
import { filterBidsByTab } from "./bid-tabs-filter";
import { MyBidCard } from "./my-bid-card";
import { MyBidsEmptyState } from "./my-bids-empty-state";
import { MyBidsTabs } from "./my-bids-tabs";

export function MyBidsView({ initialBids }: { initialBids: UserBidSummary[] }) {
  const [activeTab, setActiveTab] = useState<BidTabFilter>("todas");

  let activeCount = 0;
  let wonCount = 0;
  for (const bid of initialBids) {
    if (bid.estado_subasta === "activa") {
      activeCount += 1;
    }
    if (bid.estado_participacion === "ganada") {
      wonCount += 1;
    }
  }

  const counts = {
    todas: initialBids.length,
    activas: activeCount,
    ganadas: wonCount,
  };

  const displayedBids = filterBidsByTab(initialBids, activeTab);

  let content = <MyBidsEmptyState tab={activeTab} />;
  if (displayedBids.length > 0) {
    content = (
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedBids.map((bid) => {
          return (
            <li key={bid.subasta_id}>
              <MyBidCard bid={bid} />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <MyBidsTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="focus-visible:outline-none"
      >
        {content}
      </div>
    </div>
  );
}
