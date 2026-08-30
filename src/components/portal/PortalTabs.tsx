"use client";

import React from "react";
import { 
  Clock, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  ShieldCheck,
  Receipt
} from "lucide-react";
import { PortalTabType } from "./types";

interface PortalTabsProps {
  activeTab: PortalTabType;
  onTabChange: (tab: PortalTabType) => void;
  activeCount: number;
  historyCount: number;
  invoicesCount: number;
  addressesCount: number;
}

export default function PortalTabs({
  activeTab,
  onTabChange,
  activeCount,
  historyCount,
  invoicesCount,
  addressesCount,
}: PortalTabsProps) {
  const tabs = [
    {
      id: "ACTIVE" as PortalTabType,
      label: "En Curso",
      icon: Clock,
      count: activeCount,
    },
    {
      id: "HISTORY" as PortalTabType,
      label: "Historial",
      icon: Calendar,
      count: historyCount,
    },
    {
      id: "INVOICES" as PortalTabType,
      label: "Facturas KUDE",
      icon: Receipt,
      count: invoicesCount > 0 ? invoicesCount : undefined,
    },
    {
      id: "ADDRESSES" as PortalTabType,
      label: "Direcciones",
      icon: MapPin,
      count: addressesCount,
    },
    {
      id: "PROFILE" as PortalTabType,
      label: "Cuenta & RUC",
      icon: UserIcon,
    },
    {
      id: "GUARANTEE" as PortalTabType,
      label: "Garantía",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 min-w-max p-1.5 bg-slate-200/60 backdrop-blur-md rounded-full border border-slate-200/80 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-98 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/40"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#0071E3]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-blue-50 text-[#0071E3]" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
