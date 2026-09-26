import React, { useEffect, useRef } from 'react';
import { MapPin, Locate } from 'lucide-react';

export default function MapWidget({ title, lat = 28.6139, lng = 77.2090, deviceName = 'GPS Tracker Device', speed = 0, style = {} }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const latitude = typeof lat === 'number' && !isNaN(lat) ? lat : 28.6139;
  const longitude = typeof lng === 'number' && !isNaN(lng) ? lng : 77.2090;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Custom pulse icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background: rgba(37, 99, 235, 0.4); border-radius: 50%; animation: pulse 1.8s infinite ease-out;"></div>
            <div style="width: 14px; height: 14px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 2;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #0F172A; font-size: 13px;">${deviceName}</strong><br/>
          <span style="color: #2563EB; font-weight: 600; font-size: 11px;">Lat: ${latitude.toFixed(4)}° | Lng: ${longitude.toFixed(4)}°</span><br/>
          <span style="color: #64748B; font-size: 11px;">Speed: ${speed} km/h</span>
        </div>
      `);

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      const map = mapInstanceRef.current;
      const marker = markerRef.current;

      if (marker) {
        marker.setLatLng([latitude, longitude]);
        marker.setPopupContent(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #0F172A; font-size: 13px;">${deviceName}</strong><br/>
            <span style="color: #2563EB; font-weight: 600; font-size: 11px;">Lat: ${latitude.toFixed(4)}° | Lng: ${longitude.toFixed(4)}°</span><br/>
            <span style="color: #64748B; font-size: 11px;">Speed: ${speed} km/h</span>
          </div>
        `);
      }
      map.panTo([latitude, longitude], { animate: true, duration: 0.8 });
    }
  }, [latitude, longitude, deviceName, speed]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 8, ...style }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: inherit;
        }
      `}</style>
      
      {/* Map Control Bar Overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 400,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={16} style={{ color: '#2563EB' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{title || 'Live GPS Tracker'}</span>
          <span style={{ fontSize: 10, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 600, marginLeft: 4 }}>
            ● LIVE
          </span>
        </div>

        <button
          onClick={handleRecenter}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#2563EB',
            color: '#FFF',
            border: 'none',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
          }}
          title="Recenter Map on Device"
        >
          <Locate size={13} /> Recenter
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', flex: 1, minHeight: 180, background: '#E2E8F0' }} />

      {/* Footer Info Strip */}
      <div style={{
        padding: '6px 12px',
        background: '#FFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        color: '#64748B'
      }}>
        <span>Lat: <strong style={{ color: '#0F172A' }}>{latitude.toFixed(4)}°</strong> | Lng: <strong style={{ color: '#0F172A' }}>{longitude.toFixed(4)}°</strong></span>
        <span>Speed: <strong style={{ color: '#2563EB' }}>{speed} km/h</strong></span>
      </div>
    </div>
  );
}
