"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AddressResult {
  address: string
  postalCode: string
  blockNo: string
  roadName: string
  building: string
}

interface AddressLookupProps {
  onSelect: (result: { address: string; postalCode: string }) => void
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
  postalCodePlaceholder = "e.g. 310333",
  addressError,
  postalCodeError,
}: AddressLookupProps) {
  const [postalCode, setPostalCode] = useState(initialPostalCode)
  const [address, setAddress] = useState(initialAddress)
  const [results, setResults] = useState<AddressResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [noApiKey, setNoApiKey] = useState(false)
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
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/address/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (data.results && data.results.length > 0) {
        setResults(data.results)
        setShowDropdown(true)
        setNoApiKey(false)
      } else {
        setResults([])
        setShowDropdown(false)
        if (data.results?.length === 0) {
          setNoApiKey(true)
        }
      }
    } catch {
      setResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handlePostalCodeChange = (value: string) => {
    // Only allow digits, max 6
    const cleaned = value.replace(/\D/g, "").slice(0, 6)
    setPostalCode(cleaned)

    // Auto-search when 6 digits entered
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
    onSelect({ address: result.address, postalCode: result.postalCode })
  }

  return (
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
        {postalCode.length === 6 && noApiKey && results.length === 0 && !isSearching && (
          <p className="text-xs text-muted-foreground mt-1">
            OneMap API not configured. Enter address manually.
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
  )
}
