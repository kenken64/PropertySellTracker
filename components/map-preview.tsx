"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon issue with webpack/next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapPreviewProps {
  lat: number
  lng: number
  label?: string
  zoom?: number
}

export default function MapPreview({ lat, lng, label, zoom = 17 }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
        attributionControl: true,
      })

      // OneMap tile layer (free, no API key needed)
      L.tileLayer("https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png", {
        detectRetina: true,
        maxZoom: 19,
        minZoom: 11,
        attribution:
          '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/> OneMap | Map data &copy; contributors, <a href="https://www.sla.gov.sg/">SLA</a>',
      }).addTo(mapInstanceRef.current)

      // Add marker
      markerRef.current = L.marker([lat, lng], { icon: defaultIcon })
        .addTo(mapInstanceRef.current)

      if (label) {
        markerRef.current.bindPopup(`<div style="font-size:12px;max-width:200px;"><strong>${label}</strong></div>`).openPopup()
      }
    } else {
      // Update existing map
      mapInstanceRef.current.setView([lat, lng], zoom)

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        if (label) {
          markerRef.current.setPopupContent(`<div style="font-size:12px;max-width:200px;"><strong>${label}</strong></div>`).openPopup()
        }
      }
    }

    return () => {
      // Cleanup on unmount
    }
  }, [lat, lng, label, zoom])

  // Cleanup on full unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  return <div ref={mapRef} className="h-full w-full" style={{ minHeight: "250px" }} />
}
