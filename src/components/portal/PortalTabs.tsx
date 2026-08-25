"use client";

import React from "react";
import { 
  Clock, 
  Calendar, 
  FileText, 
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
      label: "Servicios Activos",
      icon: Clock,
      count: activeCount,
      countColor: "bg-electric-500 text-white",
    },
    {
      id: "HISTORY" as PortalTabType,
      label: "Historial de Limpiezas",
      icon: Calendar,
      count: historyCount,
      countColor: "bg-slate-200 text-slate-700",
    },
    {
      id: "INVOICES" as PortalTabType,
      label: "Facturación KUDE",
      icon: Receipt,
      count: invoicesCount > 0 ? invoicesCount : undefined,
      countColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "ADDRESSES" as PortalTabType,
      label: "Mis Direcciones",
      icon: MapPin,
      count: addressesCount,
      countColor: "bg-slate-200 text-slate-700",
    },
    {
      id: "PROFILE" as PortalTabType,
      label: "Perfil y RUC",
      icon: UserIcon,
    },
    {
      id: "GUARANTEE" as PortalTabType,
      label: "Garantía & Soporte",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 active:scale-98 ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-electric-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? "bg-electric-500 text-white" : tab.countColor
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
