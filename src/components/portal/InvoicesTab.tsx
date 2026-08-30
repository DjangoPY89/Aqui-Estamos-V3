"use client";

import React from "react";
import { 
  FileText, 
  Receipt, 
  Download, 
  Building, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Printer,
  Sparkles
} from "lucide-react";
import { Booking, User } from "@/types";
import { formatGs } from "@/lib/pricing";

interface InvoicesTabProps {
  bookings: Booking[];
  userProfile: User | null;
  onOpenInvoice: (booking: Booking) => void;
}

export default function InvoicesTab({
  bookings,
  userProfile,
  onOpenInvoice,
}: InvoicesTabProps) {
  // Las facturas legales recién se emiten cuando el estatus es "COMPLETED" (Finalizado)
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const inProgressBookings = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Banner Informativo de Facturación Electrónica KUDE / SIFEN */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-7 border border-purple-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold">
            <QrCode className="w-3.5 h-3.5" />
            <span>Sistema SIFEN / KUDE Paraguay</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Facturación Electrónica Oficial y Deducción Fiscal
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Todas las contrataciones en Aquí Estamos cuentan con emisión de Factura Electrónica legal válida ante la DNIT / SET con IVA 10% incluido para tu IRP o Impuesto a la Renta.
          </p>
        </div>

        {/* Datos Fiscales Rápidos */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-1 shrink-0 w-full md:w-auto">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Tus Datos Fiscales</span>
          <p className="font-extrabold text-white">
            {userProfile?.taxName || userProfile?.name || "Sin Razón Social"}
          </p>
          <p className="text-slate-300 font-mono">
            RUC: <strong className="text-white">{userProfile?.ruc || "Sin RUC registrado"}</strong>
          </p>
        </div>
      </div>

      {/* Aviso si hay servicios pendientes o en curso */}
      {inProgressBookings.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs">
          <div className="w-7 h-7 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
            ⏳
          </div>
          <div className="space-y-1">
            <p className="font-black text-amber-950">
              {inProgressBookings.length === 1 
                ? "Tienes 1 servicio en proceso" 
                : `Tienes ${inProgressBookings.length} servicios en proceso`}
            </p>
            <p className="text-amber-800 leading-relaxed">
              La Factura Electrónica oficial KUDE se emite y se habilitará en este panel automáticamente cuando el estado de tu servicio cambie a <strong>Finalizado</strong> por nuestro equipo operativo.
            </p>
          </div>
        </div>
      )}

      {/* Lista de Facturas y Comprobantes Emitidos */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Facturas Electrónicas Emitidas ({completedBookings.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Formato oficial KUDE con código CDC y QR
          </span>
        </div>

        {completedBookings.length === 0 ? (
          <div className="text-center py-12 space-y-3 text-slate-500 text-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7" />
            </div>
            <p className="font-bold text-slate-800 text-sm">No hay facturas emitidas todavía</p>
            <p className="max-w-md mx-auto text-slate-500">
              Tus Facturas Electrónicas oficiales se generarán automáticamente y estarán disponibles para descargar e imprimir en cuanto tus servicios sean marcados como <strong>Finalizados</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">N° Factura / CDC</th>
                  <th className="py-3 px-4">Fecha Servicio</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Total Gs (IVA 10%)</th>
                  <th className="py-3 px-4">Estado SIFEN</th>
                  <th className="py-3 px-4 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {completedBookings.map((b) => {
                  const hours = (b as any).hours || b.serviceHours || 4;
                  const price = (b as any).totalPriceGs || b.totalPrice || 0;
                  const bookingNum = (b as any).bookingNumber || b.id.slice(-6);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        001-001-{bookingNum.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.serviceDate || new Date(b.createdAt).toLocaleDateString("es-PY")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        Servicio de Limpieza {hours}hs ({b.frequency === "once" ? "Única" : "Recurrente"})
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatGs(price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black rounded-lg">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Emitida / Aprobada</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Factura KUDE</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
