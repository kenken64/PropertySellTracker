"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Lazy load map to avoid SSR issues with Leaflet
const MapPreview = dynamic(() => import("@/components/map-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
})

interface AddressResult {
  address: string
  postalCode: string
  blockNo: string
  roadName: string
  building: string
  latitude?: string
  longitude?: string
}

interface AddressLookupProps {
  onSelect: (result: { address: string; postalCode: string; latitude?: string; longitude?: string }) => void
  initialAddress?: string
  initialPostalCode?: string
  addressLabel?: string
  postalCodeLabel?: string
  addressPlaceholder?: string
  postalCodePlaceholder?: string
  addressError?: string
  postalCodeError?: string
}

export function AddressLookup({
  onSelect,
  initialAddress = "",
  initialPostalCode = "",
  addressLabel = "Address",
  postalCodeLabel = "Postal Code",
  addressPlaceholder = "Search by postal code or address...",
  postalCodePlaceholder = "e.g. 560333",
  addressError,
  postalCodeError,
}: AddressLookupProps) {
  const [postalCode, setPostalCode] = useState(initialPostalCode)
  const [address, setAddress] = useState(initialAddress)
  const [results, setResults] = useState<AddressResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; label: string } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      setShowDropdown(false)
      setNoResults(false)
      return
    }

    setIsSearching(true)
    setNoResults(false)
    try {
      const res = await fetch(`/api/address/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (data.results && data.results.length > 0) {
        setResults(data.results)
        setShowDropdown(true)

        // Auto-select first result if postal code search
        if (/^\d{6}$/.test(query) && data.results.length === 1) {
          selectResult(data.results[0])
        }
      } else {
        setResults([])
        setShowDropdown(false)
        setNoResults(true)
      }
    } catch {
      setResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handlePostalCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6)
    setPostalCode(cleaned)
    setNoResults(false)

    if (cleaned.length === 6) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSearch(cleaned), 300)
    }
  }

  const handleAddressSearch = (value: string) => {
    setAddress(value)
    onSelect({ address: value, postalCode })

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 500)
  }

  const selectResult = (result: AddressResult) => {
    setAddress(result.address)
    setPostalCode(result.postalCode)
    setShowDropdown(false)
    setResults([])
    setNoResults(false)

    if (result.latitude && result.longitude) {
      setMapLocation({
        lat: parseFloat(result.latitude),
        lng: parseFloat(result.longitude),
        label: result.address,
      })
    }

    onSelect({
      address: result.address,
      postalCode: result.postalCode,
      latitude: result.latitude,
      longitude: result.longitude,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left: Form fields */}
      <div ref={containerRef} className="space-y-4">
        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postal_code">{postalCodeLabel}</Label>
          <div className="relative">
            <Input
              id="postal_code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder={postalCodePlaceholder}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
          </div>
          {postalCodeError && <p className="text-sm text-red-500 mt-1">{postalCodeError}</p>}
          {postalCode.length === 6 && noResults && !isSearching && (
            <p className="text-xs text-muted-foreground mt-1">
              No results found. Enter address manually.
            </p>
          )}
        </div>

        {/* Address */}
        <div className="relative space-y-2">
          <Label htmlFor="address">{addressLabel}</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => handleAddressSearch(e.target.value)}
            placeholder={addressPlaceholder}
          />
          {addressError && <p className="text-sm text-red-500 mt-1">{addressError}</p>}

          {/* Dropdown results */}
          {showDropdown && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-background shadow-lg">
              {results.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectResult(result)}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                    idx > 0 && "border-t border-border/50"
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{result.address}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {result.building && result.building !== "NIL" ? `${result.building} · ` : ""}
                      Postal {result.postalCode}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Map preview */}
      <div className="h-64 lg:h-auto lg:min-h-[250px] rounded-lg overflow-hidden border border-border">
        {mapLocation ? (
          <MapPreview lat={mapLocation.lat} lng={mapLocation.lng} label={mapLocation.label} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/20 text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">Enter postal code to see location</p>
          </div>
        )}
      </div>
    </div>
  )
}
