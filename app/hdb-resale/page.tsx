"use client"

import { useMemo, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HDB_FLAT_TYPES, HDB_TOWNS } from "@/lib/hdb-data"
import { formatCurrency } from "@/lib/utils"

type SortBy = "date_desc" | "date_asc" | "price_desc" | "price_asc"

interface HdbResaleRecord {
  month: string
  block: string
  street_name: string
  storey_range: string
  floor_area_sqm: string
  resale_price: string
}

export default function HdbResalePage() {
  const [town, setTown] = useState("all")
  const [flatType, setFlatType] = useState("all")
  const [streetName, setStreetName] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("date_desc")
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<HdbResaleRecord[]>([])

  const sortedRecords = useMemo(() => {
    const cloned = [...records]

    cloned.sort((a, b) => {
      if (sortBy === "date_desc") return b.month.localeCompare(a.month)
      if (sortBy === "date_asc") return a.month.localeCompare(b.month)

      const aPrice = Number(a.resale_price)
      const bPrice = Number(b.resale_price)
      if (sortBy === "price_desc") return bPrice - aPrice
      return aPrice - bPrice
    })

    return cloned
  }, [records, sortBy])

  const handleSearch = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({ limit: "100" })

      if (town !== "all") params.set("town", town)
      if (flatType !== "all") params.set("flat_type", flatType)
      if (streetName.trim()) params.set("street_name", streetName.trim().toUpperCase())

      const response = await fetch(`/api/hdb-resale?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load HDB resale records")
      }

      setRecords(data.records || [])
    } catch (error) {
      console.error("Error searching HDB resale data:", error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">HDB Resale Data</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Search recent HDB resale transactions by town, flat type, and street.</p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Filters from Singapore open data (data.gov.sg).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="town">Town</Label>
              <Select value={town} onValueChange={setTown}>
                <SelectTrigger id="town">
                  <SelectValue placeholder="All towns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All towns</SelectItem>
                  {HDB_TOWNS.map((townOption) => (
                    <SelectItem key={townOption} value={townOption}>
                      {townOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flat-type">Flat Type</Label>
              <Select value={flatType} onValueChange={setFlatType}>
                <SelectTrigger id="flat-type">
                  <SelectValue placeholder="All flat types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All flat types</SelectItem>
                  {HDB_FLAT_TYPES.map((flatTypeOption) => (
                    <SelectItem key={flatTypeOption} value={flatTypeOption}>
                      {flatTypeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street-name">Street Name</Label>
              <Input
                id="street-name"
                placeholder="e.g. ANG MO KIO AVE 3"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Date: Newest first</SelectItem>
                  <SelectItem value="date_asc">Date: Oldest first</SelectItem>
                  <SelectItem value="price_desc">Price: High to low</SelectItem>
                  <SelectItem value="price_asc">Price: Low to high</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
            {loading ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({sortedRecords.length})</CardTitle>
          <CardDescription>Showing month, block, street, storey range, floor area, and transacted price.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-2 py-2 font-semibold">Month</th>
                  <th className="px-2 py-2 font-semibold">Block</th>
                  <th className="px-2 py-2 font-semibold">Street Name</th>
                  <th className="px-2 py-2 font-semibold">Storey Range</th>
                  <th className="px-2 py-2 font-semibold">Floor Area (sqm)</th>
                  <th className="px-2 py-2 text-right font-semibold">Resale Price</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record, index) => (
                  <tr key={`${record.month}-${record.block}-${record.street_name}-${index}`} className="border-b border-border/60">
                    <td className="px-2 py-2">{record.month}</td>
                    <td className="px-2 py-2">{record.block}</td>
                    <td className="px-2 py-2">{record.street_name}</td>
                    <td className="px-2 py-2">{record.storey_range}</td>
                    <td className="px-2 py-2">{record.floor_area_sqm}</td>
                    <td className="px-2 py-2 text-right font-semibold">{formatCurrency(Number(record.resale_price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedRecords.length === 0 && !loading && <p className="py-8 text-center text-muted-foreground">No records found. Try different filters.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
