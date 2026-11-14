import type { BidTabFilter } from "../schema";

export interface MyBidsTabsProps {
  activeTab: BidTabFilter;
  onTabChange: (tab: BidTabFilter) => void;
  counts: {
    todas: number;
    activas: number;
    ganadas: number;
  };
}

export function MyBidsTabs(props: MyBidsTabsProps) {
  const tabs: Array<{ id: BidTabFilter; label: string; count: number }> = [
    { id: "todas", label: "Todas", count: props.counts.todas },
    { id: "activas", label: "En curso / Activas", count: props.counts.activas },
    { id: "ganadas", label: "Subastas ganadas", count: props.counts.ganadas },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filtro de historial de pujas"
      className="flex flex-wrap gap-2 border-b border-line pb-4"
    >
      {tabs.map((tab) => {
        let isSelected = false;
        if (props.activeTab === tab.id) {
          isSelected = true;
        }

        let buttonStyle = "border-transparent text-ink-muted hover:bg-surface-alt hover:text-ink";
        if (isSelected) {
          buttonStyle = "border-primary bg-primary/10 text-primary font-bold shadow-xs";
        }

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => props.onTabChange(tab.id)}
            className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonStyle}`}
          >
            <span>
              <strong>{tab.label}</strong>
            </span>
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-ink">
              <strong>{tab.count}</strong>
            </span>
          </button>
        );
      })}
    </div>
  );
}
