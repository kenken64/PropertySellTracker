"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const MapPreview = dynamic(() => import("@/components/map-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
})

export interface SgAddress {
  postalCode: string
  blockNo: string
  streetName: string
  building: string
  unitNo: string
  fullAddress: string
  latitude?: string
  longitude?: string
}

interface ApiResult {
  address: string
  postalCode: string
  blockNo: string
  roadName: string
  building: string
  latitude?: string
  longitude?: string
}

interface AddressLookupProps {
  onSelect: (result: SgAddress) => void
  initialValues?: Partial<SgAddress>
  labels?: {
    postalCode?: string
    blockNo?: string
    streetName?: string
    building?: string
    unitNo?: string
    floor?: string
  }
  errors?: {
    address?: string
    postalCode?: string
  }
}

export function AddressLookup({
  onSelect,
  initialValues = {},
  labels = {},
  errors = {},
}: AddressLookupProps) {
  const [postalCode, setPostalCode] = useState(initialValues.postalCode || "")
  const [blockNo, setBlockNo] = useState(initialValues.blockNo || "")
  const [streetName, setStreetName] = useState(initialValues.streetName || "")
  const [building, setBuilding] = useState(initialValues.building || "")
  const [unitNo, setUnitNo] = useState(initialValues.unitNo || "")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<ApiResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; label: string } | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Build full address string from fields
  const buildFullAddress = useCallback((block: string, street: string, bldg: string, unit: string, postal: string) => {
    const parts: string[] = []
    if (block) parts.push(`Blk ${block}`)
    if (street) parts.push(street)
    if (unit) parts.push(`#${unit}`)
    if (bldg && bldg !== "NIL") parts.push(bldg)
    if (postal) parts.push(`Singapore ${postal}`)
    return parts.join(", ")
  }, [])

  // Notify parent of changes
  const emitChange = useCallback((overrides: Partial<{ blockNo: string; streetName: string; building: string; unitNo: string; postalCode: string; latitude: string; longitude: string }> = {}) => {
    const b = overrides.blockNo ?? blockNo
    const s = overrides.streetName ?? streetName
    const bldg = overrides.building ?? building
    const u = overrides.unitNo ?? unitNo
    const p = overrides.postalCode ?? postalCode
    onSelect({
      postalCode: p,
      blockNo: b,
      streetName: s,
      building: bldg,
      unitNo: u,
      fullAddress: buildFullAddress(b, s, bldg, u, p),
      latitude: overrides.latitude,
      longitude: overrides.longitude,
    })
  }, [blockNo, streetName, building, unitNo, postalCode, buildFullAddress, onSelect])

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
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

        // Auto-select if only one result from postal code
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
    setSearched(false)

    if (cleaned.length === 6) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setSearched(true)
        doSearch(cleaned)
      }, 300)
    }
  }

  const selectResult = (result: ApiResult) => {
    const blk = result.blockNo || ""
    const street = result.roadName || ""
    const bldg = result.building && result.building !== "NIL" ? result.building : ""
    const postal = result.postalCode || ""

    setBlockNo(blk)
    setStreetName(street)
    setBuilding(bldg)
    setPostalCode(postal)
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
      postalCode: postal,
      blockNo: blk,
      streetName: street,
      building: bldg,
      unitNo,
      fullAddress: buildFullAddress(blk, street, bldg, unitNo, postal),
      latitude: result.latitude,
      longitude: result.longitude,
    })
  }

  return (
    <div className="space-y-4">
      {/* Postal code search row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div ref={dropdownRef} className="relative space-y-2">
          <Label htmlFor="postal_code">{labels.postalCode || "Postal Code"} <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="postal_code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="e.g. 560333"
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
          {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
          {postalCode.length === 6 && searched && noResults && !isSearching && (
            <p className="text-xs text-amber-600 mt-1">
              No results found. Please enter address details manually.
            </p>
          )}

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
                      S({result.postalCode})
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Unit No */}
        <div className="space-y-2">
          <Label htmlFor="unit_no">{labels.unitNo || "Unit No."}</Label>
          <Input
            id="unit_no"
            type="text"
            value={unitNo}
            onChange={(e) => {
              setUnitNo(e.target.value)
              emitChange({ unitNo: e.target.value })
            }}
            placeholder="e.g. 12-345"
          />
          <p className="text-xs text-muted-foreground">Floor-Unit (e.g. 12-345)</p>
        </div>
      </div>

      {/* Auto-filled address fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="block_no">{labels.blockNo || "Block / House No."}</Label>
          <Input
            id="block_no"
            type="text"
            value={blockNo}
            onChange={(e) => {
              setBlockNo(e.target.value)
              emitChange({ blockNo: e.target.value })
            }}
            placeholder="e.g. 333"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street_name">{labels.streetName || "Street Name"}</Label>
          <Input
            id="street_name"
            type="text"
            value={streetName}
            onChange={(e) => {
              setStreetName(e.target.value)
              emitChange({ streetName: e.target.value })
            }}
            placeholder="e.g. ANG MO KIO AVENUE 1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="building_name">{labels.building || "Building Name"}</Label>
        <Input
          id="building_name"
          type="text"
          value={building}
          onChange={(e) => {
            setBuilding(e.target.value)
            emitChange({ building: e.target.value })
          }}
          placeholder="e.g. TECK GHEE VIEW"
        />
      </div>

      {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}

      {/* Map preview */}
      <div className="h-64 rounded-lg overflow-hidden border border-border">
        {mapLocation ? (
          <MapPreview lat={mapLocation.lat} lng={mapLocation.lng} label={mapLocation.label} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/20 text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">Enter postal code to see location on map</p>
          </div>
        )}
      </div>
    </div>
  )
}
