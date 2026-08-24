"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Search,
  Crosshair,
  Sparkles
} from "lucide-react";
import "leaflet/dist/leaflet.css";

interface GoogleMapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (coords: { lat: number; lng: number; addressSuggestion?: string }) => void;
  currentAddress: string;
}

type MapStyle = "google_streets" | "google_hybrid" | "carto_voyager";

const PRESET_ZONES = [
  { name: "Villa Morra", lat: -25.2831, lng: -57.5612, desc: "Asunción (Eje Corporativo / Shopping)" },
  { name: "Ykua Satî", lat: -25.2890, lng: -57.5520, desc: "Asunción (Santa Teresa / Torres)" },
  { name: "Carmelitas", lat: -25.2775, lng: -57.5670, desc: "Asunción (Senador Long / España)" },
  { name: "Centro / Mcal. López", lat: -25.2867, lng: -57.6470, desc: "Asunción (Casco Histórico)" },
  { name: "Mburucuyá / Las Lomas", lat: -25.2650, lng: -57.5580, desc: "Asunción (Zona Residencial)" },
  { name: "Luque", lat: -25.2678, lng: -57.4856, desc: "Gran Asunción (Aeropuerto / Conmebol)" },
  { name: "Lambaré", lat: -25.3456, lng: -57.6083, desc: "Gran Asunción (Yacht / Av. Cacique)" },
  { name: "San Lorenzo", lat: -25.3392, lng: -57.5089, desc: "Gran Asunción (Campus UNA / Centro)" },
  { name: "Fernando de la Mora", lat: -25.3211, lng: -57.5528, desc: "Gran Asunción (Zona Norte / Sur)" },
];

export default function GoogleMapPicker({
  latitude,
  longitude,
  onLocationChange,
  currentAddress,
}: GoogleMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>("google_streets");
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Inicializar Leaflet con soporte para Google Maps Tiles de forma segura
  useEffect(() => {
    let isMounted = true;
    let mapTimer: any = null;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        if (!isMounted || !mapContainerRef.current) return;

        const container = mapContainerRef.current;

        // Limpiar instancia previa si existía
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {}
          mapInstanceRef.current = null;
        }

        // Eliminar rastro de _leaflet_id en el nodo DOM para evitar conflicto
        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }

        // Validar que el contenedor esté conectado al documento
        if (!container.isConnected && !document.body.contains(container)) {
          return;
        }

        // Crear mapa con controles personalizados
        const map = L.map(container, {
          center: [latitude, longitude],
          zoom: 16,
          zoomControl: false, // Usaremos botones flotantes modernos
          attributionControl: false,
        });

        // Añadir capa de Google Maps (Calles HD oficiales)
        const tileLayer = getTileLayer(L, mapStyle);
        tileLayer.addTo(map);
        currentTileLayerRef.current = tileLayer;

        // Pin de Google Maps estilizado con sombra 3D y pulso de radar
        const customPinIcon = L.divIcon({
          className: "custom-google-pin-wrapper",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
              <!-- Radar Ripple -->
              <div style="
                position: absolute;
                bottom: 0px;
                width: 32px;
                height: 32px;
                background: rgba(239, 68, 68, 0.25);
                border-radius: 50%;
                transform: scale(1);
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                pointer-events: none;
              "></div>

              <!-- Google Pin Body -->
              <div style="
                width: 38px;
                height: 38px;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                border: 3px solid #ffffff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 6px 16px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
              ">
                <!-- Pin Dot -->
                <div style="
                  width: 12px;
                  height: 12px;
                  background: #ffffff;
                  border-radius: 50%;
                  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
                "></div>
              </div>

              <!-- Ground Shadow -->
              <div style="
                width: 16px;
                height: 6px;
                background: rgba(0,0,0,0.35);
                border-radius: 50%;
                margin-top: 3px;
                filter: blur(1.5px);
              "></div>
            </div>
          `,
          iconSize: [38, 48],
          iconAnchor: [19, 46],
        });

        // Crear Marcador Arrastrable (Draggable)
        const marker = L.marker([latitude, longitude], {
          icon: customPinIcon,
          draggable: true,
          autoPan: true,
        }).addTo(map);

        // Evento: Al terminar de arrastrar el pin
        marker.on("dragend", (e: any) => {
          const newPos = e.target.getLatLng();
          onLocationChange({
            lat: newPos.lat,
            lng: newPos.lng,
            addressSuggestion: `Ubicación GPS (${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)})`,
          });
          setGeoStatus("✓ Pin reubicado con éxito.");
          setTimeout(() => setGeoStatus(null), 3000);
        });

        // Evento: Al hacer clic en cualquier lugar del mapa
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          map.panTo([lat, lng]);
          onLocationChange({
            lat,
            lng,
            addressSuggestion: `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          });
          setGeoStatus("✓ Pin colocado en el punto seleccionado.");
          setTimeout(() => setGeoStatus(null), 3000);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        if (isMounted) setIsMapReady(true);

        // Invalidate size para recalcular dimensiones exactas al renderizar en modal o pestaña
        mapTimer = setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            try {
              mapInstanceRef.current.invalidateSize();
            } catch (e) {}
          }
        }, 250);
      } catch (err) {
        console.error("Error al inicializar mapa Leaflet:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapTimer) clearTimeout(mapTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Sincronizar posición del marcador cuando cambian las coordenadas externas (ej: al elegir zona)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      try {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
      } catch (e) {}
    }
  }, [latitude, longitude]);

  // Función para obtener la capa de mapa según el estilo seleccionado
  const getTileLayer = (L: any, style: MapStyle) => {
    if (style === "google_streets") {
      // Google Maps Calles HD Oficial
      return L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
    } else if (style === "google_hybrid") {
      // Google Maps Satelital Híbrido (Fotos satelitales con nombres de calles)
      return L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
    } else {
      // CartoDB Voyager Moderno (Estilo limpio / pastel)
      return L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      });
    }
  };

  // Cambiar capa visual cuando el usuario elige otro estilo
  const handleStyleChange = async (newStyle: MapStyle) => {
    setMapStyle(newStyle);
    if (mapInstanceRef.current && typeof window !== "undefined") {
      const L = (await import("leaflet")).default;
      if (currentTileLayerRef.current) {
        mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
      }
      const newLayer = getTileLayer(L, newStyle);
      newLayer.addTo(mapInstanceRef.current);
      currentTileLayerRef.current = newLayer;
    }
  };

  // Actualizar posición del marcador si las coordenadas cambian externamente
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.flyTo([latitude, longitude], 16, {
          duration: 0.8,
        });
      }
    }
  }, [latitude, longitude]);

  // Usar GPS del dispositivo
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus("La geolocalización no es compatible con tu navegador.");
      return;
    }

    setIsLocating(true);
    setGeoStatus("Detectando tu ubicación satelital...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setIsLocating(false);
        setGeoStatus("✓ Ubicación GPS detectada con éxito.");
        onLocationChange({
          lat,
          lng,
          addressSuggestion: `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        });
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1 });
        }
        setTimeout(() => setGeoStatus(null), 4000);
      },
      (error) => {
        setIsLocating(false);
        setGeoStatus("No se pudo obtener la señal GPS (permiso denegado).");
        setTimeout(() => setGeoStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Centrar mapa en la posición actual
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 0.6 });
    }
  };

  // Zoom In / Zoom Out
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Seleccionar zona preestablecida
  const handleSelectZone = (zone: typeof PRESET_ZONES[0]) => {
    onLocationChange({
      lat: zone.lat,
      lng: zone.lng,
      addressSuggestion: `${zone.name}, Asunción`,
    });
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([zone.lat, zone.lng]);
      mapInstanceRef.current.flyTo([zone.lat, zone.lng], 16, { duration: 0.8 });
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="space-y-3.5 bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs">
      
      {/* Cabecera del Mapa con Selector de Estilos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-electric-600 text-white flex items-center justify-center shadow-electric-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span>Google Maps Interactivo</span>
              <span className="text-[10px] font-bold bg-electric-100 text-electric-800 px-2 py-0.5 rounded-full border border-electric-200">
                Punto Arrastrable
              </span>
            </h4>
            <p className="text-[11px] text-neutral-500">
              Arrastra el pin o haz clic en el mapa para ubicar el inmueble
            </p>
          </div>
        </div>

        {/* Botón Destacado: Detectar mi Ubicación GPS */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="flex items-center gap-2 bg-white hover:bg-electric-50 text-electric-700 hover:text-electric-800 px-3.5 py-2 rounded-xl border border-electric-200 shadow-xs font-bold text-xs transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-electric-600" : "text-electric-600"}`} />
          <span>{isLocating ? "Detectando GPS..." : "📍 Detectar mi ubicación GPS"}</span>
        </button>
      </div>

      {geoStatus && (
        <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
          geoStatus.startsWith("✓") 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
            : "bg-amber-50 text-amber-800 border border-amber-200"
        }`}>
          {geoStatus.startsWith("✓") ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
          <span className="font-medium">{geoStatus}</span>
        </div>
      )}

      {/* Contenedor del Mapa Google Maps */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-neutral-300 shadow-md bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Badge Flotante Superior: Coordenadas y Estado */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono font-bold text-neutral-900">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
        </div>

        {/* Botones de Control Flotantes (Zoom & GPS) */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            title="Detectar mi ubicación satelital"
            className="w-9 h-9 bg-white hover:bg-electric-50 text-neutral-800 hover:text-electric-700 rounded-xl shadow-md border border-neutral-200 flex items-center justify-center transition-all disabled:opacity-50 active:scale-95"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin text-electric-600" : "text-electric-600"}`} />
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            title="Centrar en el pin"
            className="w-9 h-9 bg-white hover:bg-neutral-50 text-neutral-700 rounded-xl shadow-md border border-neutral-200 flex items-center justify-center transition-all active:scale-95 text-xs font-bold"
          >
            <Crosshair className="w-4 h-4 text-neutral-600" />
          </button>

          <div className="flex flex-col bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Acercar"
              className="w-9 h-8 hover:bg-neutral-100 text-neutral-800 font-black text-sm flex items-center justify-center border-b border-neutral-100 transition-colors"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Alejar"
              className="w-9 h-8 hover:bg-neutral-100 text-neutral-800 font-black text-sm flex items-center justify-center transition-colors"
            >
              −
            </button>
          </div>
        </div>

        {/* Indicador Flotante Inferior de Instrucciones */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
          <div className="bg-neutral-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-medium shadow-lg flex items-center gap-1.5">
            <span>👆</span>
            <span>Arrastra el pin rojo o haz clic sobre la calle</span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto bg-white/95 backdrop-blur-md text-neutral-800 hover:text-electric-700 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-lg border border-neutral-200 flex items-center gap-1 transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>
        </div>
      </div>

      {/* Accesos Rápidos de Zonas Populares en Asunción */}
      <div>
        <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
          Atajos directos por barrio o ciudad:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ZONES.map((zone) => {
            const isCurrent = Math.abs(zone.lat - latitude) < 0.005 && Math.abs(zone.lng - longitude) < 0.005;
            return (
              <button
                key={zone.name}
                type="button"
                onClick={() => handleSelectZone(zone)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                  isCurrent
                    ? "bg-electric-600 text-white border-electric-600 shadow-electric-xs font-bold"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300"
                }`}
              >
                {zone.name}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
