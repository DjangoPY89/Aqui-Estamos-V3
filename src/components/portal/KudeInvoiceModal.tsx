"use client";

import React from "react";
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  QrCode, 
  Building, 
  ShieldCheck,
  X
} from "lucide-react";
import { Booking, User } from "@/types";
import { formatGs } from "@/lib/pricing";

interface KudeInvoiceModalProps {
  booking: Booking | null;
  userProfile: User | null;
  onClose: () => void;
}

export default function KudeInvoiceModal({
  booking,
  userProfile,
  onClose,
}: KudeInvoiceModalProps) {
  if (!booking) return null;

  const hours = (booking as any).hours || booking.serviceHours || 4;
  const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
  const bookingNum = (booking as any).bookingNumber || booking.id.slice(-7);

  const invoiceNumber = `001-001-${bookingNum.padStart(7, "0")}`;
  const cdcCode = `01801234567001001${bookingNum.padStart(7, "0")}1202608251234567890`;
  const subtotal10 = price;
  const iva10 = Math.round(subtotal10 / 11);
  const gravada10 = subtotal10 - iva10;

  const customerTaxName = userProfile?.taxName || booking.customerName;
  const customerRuc = userProfile?.ruc || "44444401-7 (Sin RUC)";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 space-y-6">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera KUDE Oficial */}
        <div className="border-2 border-slate-900 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-md text-[10px] font-black uppercase tracking-wider mb-1">
                KUDE - Documento Tributario Electrónico
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                AQUÍ ESTAMOS S.A.
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Servicios Integrales de Limpieza y Mantenimiento
              </p>
              <p className="text-[11px] text-slate-500">
                Avda. Santa Teresa 1827 c/ Aviadores del Chaco • Asunción, Paraguay
              </p>
            </div>

            <div className="text-right sm:text-right border-l-0 sm:border-l sm:pl-4 border-slate-200 text-xs space-y-0.5">
              <p className="font-mono font-black text-slate-900 text-sm">RUC: 80123456-7</p>
              <p className="font-bold text-purple-700 font-mono">TIMBRADO N°: 16543210</p>
              <p className="text-[11px] text-slate-500">Vigencia: 2025 - 2027</p>
              <p className="font-mono font-black text-slate-900 text-xs pt-1">
                FACTURA ELECTRÓNICA
              </p>
              <p className="font-mono font-bold text-electric-600 text-xs">
                N° {invoiceNumber}
              </p>
            </div>
          </div>

          {/* Datos del Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nombre / Razón Social:</span>
              <p className="font-black text-slate-900 truncate">{customerTaxName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">RUC / C.I.:</span>
              <p className="font-mono font-black text-slate-900">{customerRuc}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha de Emisión:</span>
              <p className="font-bold text-slate-800">{new Date(booking.createdAt).toLocaleDateString("es-PY")}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Condición de Venta:</span>
              <p className="font-bold text-slate-800">Contado (Al Servicio)</p>
            </div>
          </div>

          {/* Detalle de Ítems */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-y border-slate-300">
                <tr>
                  <th className="py-2 px-2">Cant.</th>
                  <th className="py-2 px-2">Descripción</th>
                  <th className="py-2 px-2 text-right">P. Unitario</th>
                  <th className="py-2 px-2 text-right">Gravadas 10%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr>
                  <td className="py-2.5 px-2 font-mono">1</td>
                  <td className="py-2.5 px-2">
                    Servicio de Limpieza Profesional ({hours} horas) - Personal IPS
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatGs(price)}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold">{formatGs(price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Liquidación de IVA */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-200">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Liquidación IVA (10%):</span>
              <span className="font-mono">{formatGs(iva10)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-700">
              <span>Total Gravadas:</span>
              <span className="font-mono">{formatGs(gravada10)}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>TOTAL GENERAL EN GUARANÍES:</span>
              <span className="text-purple-700 font-mono">{formatGs(price)}</span>
            </div>
          </div>

          {/* CDC y Código QR */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-slate-200">
            <div className="w-20 h-20 bg-slate-900 text-white rounded-xl p-2 flex items-center justify-center shrink-0">
              <QrCode className="w-16 h-16 text-white" />
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Código CDC SIFEN Oficial:</span>
              <p className="font-mono text-[10px] text-slate-800 font-bold break-all bg-slate-100 p-1.5 rounded-lg">
                {cdcCode}
              </p>
              <p className="text-[10px] text-slate-500">
                Consulte la validez de este Documento Tributario Electrónico en el portal de la SET / DNIT.
              </p>
            </div>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Factura Oficial (KUDE)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-98"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
