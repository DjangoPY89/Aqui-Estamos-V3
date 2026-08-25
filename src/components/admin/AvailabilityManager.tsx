"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Sparkles, 
  CalendarOff,
  Settings2,
  CalendarRange,
  ArrowRight
} from 'lucide-react';
import { 
  AvailabilitySettings, 
  DayOfWeek, 
  BlockedDate, 
  TimeSlotConfig, 
  Employee 
} from '@/types';

interface AvailabilityManagerProps {
  employees: Employee[];
  onNotice?: (msg: string) => void;
}

const DAY_LABELS: { id: DayOfWeek; label: string; desc: string }[] = [
  { id: 'monday', label: 'Lunes', desc: 'Inicio de semana laboral' },
  { id: 'tuesday', label: 'Martes', desc: 'Día operativo regular' },
  { id: 'wednesday', label: 'Miércoles', desc: 'Día operativo regular' },
  { id: 'thursday', label: 'Jueves', desc: 'Día operativo regular' },
  { id: 'friday', label: 'Viernes', desc: 'Día operativo regular' },
  { id: 'saturday', label: 'Sábado', desc: 'Horario especial de fin de semana' },
  { id: 'sunday', label: 'Domingo', desc: 'Descanso semanal de la cuadrilla' },
];

export default function AvailabilityManager({ employees, onNotice }: AvailabilityManagerProps) {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('¡Configuración guardada correctamente!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulario para nuevo bloqueo de fecha o rango
  const [blockMode, setBlockMode] = useState<'SINGLE' | 'RANGE'>('SINGLE');
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedEndDate, setNewBlockedEndDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [isAddingBlockedDate, setIsAddingBlockedDate] = useState(false);

  // Formulario para nuevo turno
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Cargar configuraciones (con no-store para evitar caching)
  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/availability-settings?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar configuraciones');
      setSettings(data.settings);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Guardar configuraciones y persistir en el servidor
  const handleSave = async (customSettings?: AvailabilitySettings, customSuccessMsg?: string) => {
    const toSave = customSettings || settings;
    if (!toSave) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/availability-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      
      setSettings(data.settings);
      setSaveMessage(customSuccessMsg || '¡Configuración guardada y sincronizada con éxito!');
      setSaveSuccess(true);
      if (onNotice) onNotice(customSuccessMsg || '¡Configuraciones de disponibilidad guardadas con éxito!');
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar configuraciones');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-electric-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Cargando configuraciones de disponibilidad y calendario...</p>
      </div>
    );
  }

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE');
  const activeCount = Math.max(1, activeEmployees.length);
  const calculatedDailyCapacity = settings.capacityMode === 'AUTO_BY_EMPLOYEES'
    ? activeCount * (settings.maxBookingsPerEmployeePerDay || 1)
    : settings.manualDailyMaxBookings;

  // Modificadores de Estado con Auto-Save
  const toggleDay = (dayKey: DayOfWeek) => {
    const updated = {
      ...settings,
      workingDays: {
        ...settings.workingDays,
        [dayKey]: {
          ...settings.workingDays[dayKey],
          enabled: !settings.workingDays[dayKey].enabled,
        },
      },
    };
    if (dayKey === 'sunday') {
      updated.allowSundayBookings = !settings.workingDays.sunday.enabled;
    }
    setSettings(updated);
    handleSave(updated, `Día ${updated.workingDays[dayKey].name} ${updated.workingDays[dayKey].enabled ? 'habilitado' : 'cerrado'} correctamente.`);
  };

  const updateDayTimes = (dayKey: DayOfWeek, startTime: string, endTime: string) => {
    const updated = {
      ...settings,
      workingDays: {
        ...settings.workingDays,
        [dayKey]: {
          ...settings.workingDays[dayKey],
          startTime,
          endTime,
        },
      },
    };
    setSettings(updated);
  };

  const toggleTimeSlot = (slotId: string) => {
    const updatedSlots = settings.timeSlots.map((s) =>
      s.id === slotId ? { ...s, enabled: !s.enabled } : s
    );
    const updated = { ...settings, timeSlots: updatedSlots };
    setSettings(updated);
    handleSave(updated, 'Turno actualizado con éxito.');
  };

  const toggleHoliday = (holidayId: string) => {
    const updatedHolidays = settings.blockedDates.map((h) =>
      h.id === holidayId ? { ...h, enabled: !h.enabled } : h
    );
    const updated = { ...settings, blockedDates: updatedHolidays };
    setSettings(updated);
    handleSave(updated, 'Estado de fecha o feriado actualizado.');
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;

    let finalEndDate: string | undefined = undefined;
    if (blockMode === 'RANGE' && newBlockedEndDate) {
      if (newBlockedEndDate < newBlockedDate) {
        setErrorMessage('La fecha de fin debe ser posterior o igual a la fecha de inicio.');
        return;
      }
      finalEndDate = newBlockedEndDate;
    }

    const reasonLabel = newBlockedReason.trim() || (blockMode === 'RANGE' ? 'Receso / Rango Bloqueado' : 'Día No Laborable');

    const newEntry: BlockedDate = {
      id: `custom_${Date.now()}`,
      date: newBlockedDate,
      endDate: finalEndDate,
      reason: reasonLabel,
      isHoliday: false,
      enabled: true,
    };

    const updatedBlocked = [newEntry, ...settings.blockedDates];
    const updatedSettings = { ...settings, blockedDates: updatedBlocked };
    
    setSettings(updatedSettings);
    setNewBlockedDate('');
    setNewBlockedEndDate('');
    setNewBlockedReason('');
    setIsAddingBlockedDate(false);
    setErrorMessage(null);

    const msg = finalEndDate 
      ? `¡Rango bloqueado del ${newEntry.date} al ${finalEndDate} guardado con éxito!`
      : `¡Fecha ${newEntry.date} bloqueada y guardada con éxito!`;

    await handleSave(updatedSettings, msg);
  };

  const handleDeleteBlockedDate = (id: string) => {
    const filtered = settings.blockedDates.filter((b) => b.id !== id);
    const updated = { ...settings, blockedDates: filtered };
    setSettings(updated);
    handleSave(updated, 'Fecha o rango eliminado con éxito.');
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;

    const newSlot: TimeSlotConfig = {
      id: `slot_${Date.now()}`,
      time: newSlotTime,
      label: newSlotLabel.trim() || `Turno ${newSlotTime}`,
      period: parseInt(newSlotTime.split(':')[0], 10) < 12 ? 'morning' : 'afternoon',
      enabled: true,
    };

    const updated = { ...settings, timeSlots: [...settings.timeSlots, newSlot] };
    setSettings(updated);
    setNewSlotTime('');
    setNewSlotLabel('');
    setIsAddingSlot(false);
    handleSave(updated, 'Nuevo turno agregado y guardado con éxito.');
  };

  const handleDeleteSlot = (id: string) => {
    const filtered = settings.timeSlots.filter((s) => s.id !== id);
    const updated = { ...settings, timeSlots: filtered };
    setSettings(updated);
    handleSave(updated, 'Turno eliminado correctamente.');
  };

  // Calcular cantidad de días en un rango
  const calculateDaysInRange = (startDate: string, endDate?: string) => {
    if (!endDate || endDate === startDate) return 1;
    const diff = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Barra Superior Informativa y Botón de Guardado */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-electric-500/20 text-electric-300 border border-electric-500/30 rounded-full text-xs font-bold">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Calendario Operativo & Cuadrilla</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Gestión de Disponibilidad y Capacidad Diaria
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Controla qué días y turnos pueden elegir los clientes en el formulario de reservas, la capacidad máxima de solicitudes por día según las empleadas disponibles y el bloqueo de fechas individuales o rangos completos.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="w-full md:w-auto px-6 py-3.5 bg-electric-600 hover:bg-electric-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-electric-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Guardando Cambios...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>

      {/* Alertas */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">{saveMessage}</p>
            <p className="text-[11px] text-emerald-700">El cotizador web ahora refleja estos cambios inmediatamente para los clientes.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPIs Rápidos de Capacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Capacidad Diaria Máxima</span>
            <Sparkles className="w-4 h-4 text-electric-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {calculatedDailyCapacity} <span className="text-xs font-semibold text-slate-400">citas / día</span>
          </p>
          <p className="text-[11px] text-slate-500">
            {settings.capacityMode === 'AUTO_BY_EMPLOYEES'
              ? `${activeCount} empleadas activas × ${settings.maxBookingsPerEmployeePerDay || 1} servicio`
              : 'Límite fijo manual'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Personal IPS Activo</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {activeCount} <span className="text-xs font-semibold text-slate-400">empleadas</span>
          </p>
          <p className="text-[11px] text-slate-500">Listas para asignación de turnos</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Domingos</span>
            <CalendarOff className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 flex items-center gap-2">
            {settings.workingDays.sunday.enabled ? (
              <span className="text-emerald-600">🟢 Abierto</span>
            ) : (
              <span className="text-rose-600">🔴 Cerrado</span>
            )}
          </p>
          <p className="text-[11px] text-slate-500">
            {settings.workingDays.sunday.enabled ? 'Se reciben citas dominicales' : 'Descanso semanal obligatorio'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Feriados & Bloqueos</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">
            {settings.blockedDates.filter((b) => b.enabled).length}{' '}
            <span className="text-xs font-semibold text-slate-400">reglas</span>
          </p>
          <p className="text-[11px] text-slate-500">Días o rangos bloqueados</p>
        </div>
      </div>

      {/* SECCIÓN 1: REGLAS DE CAPACIDAD Y CUADRILLA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Capacidad Máxima de Citas Diarias
              </h3>
              <p className="text-xs text-slate-500">
                Define cuántas veces se puede reservar un mismo día en base al personal disponible.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Opción 1: Capacidad Automática por Empleados */}
          <div
            onClick={() => {
              const updated = { ...settings, capacityMode: 'AUTO_BY_EMPLOYEES' as const };
              setSettings(updated);
              handleSave(updated, 'Modo de capacidad automática por cuadrilla activado.');
            }}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.capacityMode === 'AUTO_BY_EMPLOYEES'
                ? 'border-electric-600 bg-electric-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="text-base">⚡</span> Modo Automático (Recomendado)
              </span>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                settings.capacityMode === 'AUTO_BY_EMPLOYEES' ? 'border-electric-600 bg-electric-600' : 'border-slate-300'
              }`}>
                {settings.capacityMode === 'AUTO_BY_EMPLOYEES' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              La capacidad diaria se calcula automáticamente multiplicando la cantidad de empleadas activas (<strong>{activeCount}</strong>) por los turnos permitidos por día.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">
                Servicios por Empleada / Día:
              </label>
              <select
                value={settings.maxBookingsPerEmployeePerDay || 1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const updated = { ...settings, maxBookingsPerEmployeePerDay: val };
                  setSettings(updated);
                  handleSave(updated);
                }}
                className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-electric-600"
              >
                <option value={1}>1 servicio por empleada (Recomendado para 6h/8h)</option>
                <option value={2}>2 servicios por empleada (Mañana y Tarde)</option>
              </select>
            </div>
          </div>

          {/* Opción 2: Límite Manual Fijo */}
          <div
            onClick={() => {
              const updated = { ...settings, capacityMode: 'MANUAL_LIMIT' as const };
              setSettings(updated);
              handleSave(updated, 'Modo de límite manual fijo activado.');
            }}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.capacityMode === 'MANUAL_LIMIT'
                ? 'border-electric-600 bg-electric-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="text-base">🎯</span> Límite Fijo Manual
              </span>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                settings.capacityMode === 'MANUAL_LIMIT' ? 'border-electric-600 bg-electric-600' : 'border-slate-300'
              }`}>
                {settings.capacityMode === 'MANUAL_LIMIT' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Establece un número fijo estricto de citas máximas que la plataforma puede aceptar por día, independientemente del total de empleadas.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">
                Máximo de reservas al día:
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.manualDailyMaxBookings || 4}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  const updated = { ...settings, manualDailyMaxBookings: val };
                  setSettings(updated);
                }}
                onBlur={() => handleSave(settings)}
                className="w-20 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-electric-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DÍAS DE LA SEMANA Y DOMINGOS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Días de Atención Semanal
              </h3>
              <p className="text-xs text-slate-500">
                Habilita o deshabilita los días en que el sistema permite reservar servicios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleDay('sunday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              settings.workingDays.sunday.enabled
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {settings.workingDays.sunday.enabled ? 'Cerrar Domingos' : 'Abrir Domingos'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {DAY_LABELS.map(({ id, label, desc }) => {
            const day = settings.workingDays[id];
            const isSunday = id === 'sunday';

            return (
              <div
                key={id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  day.enabled
                    ? isSunday
                      ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 shadow-2xs'
                    : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">{label}</span>
                    {isSunday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        Fin de Semana
                      </span>
                    )}
                  </div>
                  
                  {/* Switch Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={() => toggleDay(id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-600"></div>
                  </label>
                </div>

                <p className="text-[10px] text-slate-500">{desc}</p>

                {day.enabled ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Apertura</label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDayTimes(id, e.target.value, day.endTime)}
                        onBlur={() => handleSave(settings)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Cierre</label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDayTimes(id, day.startTime, e.target.value)}
                        onBlur={() => handleSave(settings)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <span>🔴 Cerrado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 3: HORARIOS Y TURNOS DE LLEGADA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Turnos y Horarios de Servicio
              </h3>
              <p className="text-xs text-slate-500">
                Franjas horarias disponibles para que el cliente elija la hora de llegada de su personal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSlot(!isAddingSlot)}
            className="px-3 py-1.5 bg-electric-50 hover:bg-electric-100 text-electric-700 border border-electric-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Turno</span>
          </button>
        </div>

        {/* Formulario para nuevo turno */}
        {isAddingSlot && (
          <form onSubmit={handleAddCustomSlot} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hora de Llegada (HH:MM)</label>
              <input
                type="time"
                required
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Etiqueta Visible</label>
              <input
                type="text"
                placeholder="Ej: Turno Vespertino (15:00)"
                value={newSlotLabel}
                onChange={(e) => setNewSlotLabel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-electric-600 text-white rounded-xl text-xs font-bold hover:bg-electric-700"
              >
                Añadir Turno
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSlot(false)}
                className="py-2 px-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {settings.timeSlots.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                slot.enabled
                  ? 'bg-slate-50 border-slate-200 shadow-2xs'
                  : 'bg-neutral-100/70 border-neutral-200 opacity-50'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900">{slot.time}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    slot.period === 'morning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {slot.period === 'morning' ? 'Mañana' : 'Tarde'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 truncate">{slot.label}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => toggleTimeSlot(slot.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-600"></div>
                </label>

                {slot.id.startsWith('slot_') && slot.id.length > 10 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Eliminar turno personalizado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 4: FERIADOS Y BLOQUEO DE FECHAS / RANGOS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CalendarOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Feriados de Paraguay y Bloqueo de Fechas o Rangos
              </h3>
              <p className="text-xs text-slate-500">
                Bloquea días específicos o rangos de fechas completas (vacaciones, mantenimiento, receso).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingBlockedDate(!isAddingBlockedDate)}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Bloquear Fecha o Rango</span>
          </button>
        </div>

        {/* Formulario para bloquear fecha única o rango de fechas */}
        {isAddingBlockedDate && (
          <form onSubmit={handleAddBlockedDate} className="p-5 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-4 animate-in fade-in">
            {/* Selector de Modo: Fecha Única vs Rango */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Tipo de Bloqueo:</span>
              <div className="flex bg-white p-1 rounded-xl border border-purple-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBlockMode('SINGLE')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    blockMode === 'SINGLE'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📅 Fecha Única
                </button>
                <button
                  type="button"
                  onClick={() => setBlockMode('RANGE')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    blockMode === 'RANGE'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🗓️ Rango de Fechas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {blockMode === 'RANGE' ? 'Fecha de Inicio *' : 'Fecha a Bloquear *'}
                </label>
                <input
                  type="date"
                  required
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {blockMode === 'RANGE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    required
                    min={newBlockedDate}
                    value={newBlockedEndDate}
                    onChange={(e) => setNewBlockedEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              )}

              <div className={blockMode === 'RANGE' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo del Cierre</label>
                <input
                  type="text"
                  placeholder={blockMode === 'RANGE' ? 'Ej: Vacaciones de Cuadrilla / Receso' : 'Ej: Feriado Extraordinario / Inventario'}
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            {blockMode === 'RANGE' && newBlockedDate && newBlockedEndDate && (
              <div className="p-2.5 bg-purple-100/60 text-purple-900 text-xs rounded-xl flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4 text-purple-700" />
                  <span>Bloqueará {calculateDaysInRange(newBlockedDate, newBlockedEndDate)} días consecutivos ({newBlockedDate} al {newBlockedEndDate})</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-sm transition-all active:scale-98 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{blockMode === 'RANGE' ? 'Guardar y Bloquear Rango' : 'Guardar y Bloquear Fecha'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBlockedDate(false)}
                className="py-2.5 px-4 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Tabla de Feriados y Bloqueos */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha / Período</th>
                <th className="py-3 px-4">Motivo / Festividad</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {settings.blockedDates.map((b) => {
                const isRange = !!b.endDate && b.endDate !== b.date;
                const daysCount = isRange ? calculateDaysInRange(b.date, b.endDate) : 1;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {isRange ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-700 font-black">{b.date}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-purple-700 font-black">{b.endDate}</span>
                          <span className="text-[10px] font-bold text-slate-500 ml-1">({daysCount} días)</span>
                        </div>
                      ) : (
                        <span>{b.date}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {b.reason}
                    </td>
                    <td className="py-2.5 px-4">
                      {b.isHoliday ? (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-md">
                          Feriado Oficial PY
                        </span>
                      ) : isRange ? (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-md">
                          🗓️ Rango de Fechas
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md">
                          📅 Fecha Puntual
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={b.enabled}
                          onChange={() => toggleHoliday(b.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {!b.isHoliday && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBlockedDate(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                          title="Eliminar fecha o rango bloqueado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
