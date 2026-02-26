const HDB_RESOURCE_ID = "f1765b54-a209-4718-8d38-a39237f502b3"

export const HDB_TOWNS = [
  "ANG MO KIO",
  "BEDOK",
  "BISHAN",
  "BUKIT BATOK",
  "BUKIT MERAH",
  "BUKIT PANJANG",
  "BUKIT TIMAH",
  "CENTRAL AREA",
  "CHOA CHU KANG",
  "CLEMENTI",
  "GEYLANG",
  "HOUGANG",
  "JURONG EAST",
  "JURONG WEST",
  "KALLANG/WHAMPOA",
  "MARINE PARADE",
  "PASIR RIS",
  "PUNGGOL",
  "QUEENSTOWN",
  "SEMBAWANG",
  "SENGKANG",
  "SERANGOON",
  "TAMPINES",
  "TOA PAYOH",
  "WOODLANDS",
  "YISHUN",
] as const

export const HDB_FLAT_TYPES = ["1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "MULTI-GENERATION"] as const

export interface HdbResaleRecord {
  month: string
  town: string
  flat_type: string
  block: string
  street_name: string
  storey_range: string
  floor_area_sqm: string
  flat_model: string
  lease_commence_date: string
  remaining_lease: string
  resale_price: string
}

interface FetchHdbResaleParams {
  town?: string
  flat_type?: string
  street_name?: string
  limit?: number
}

export async function fetchHdbResaleData(params: FetchHdbResaleParams = {}) {
  const { town, flat_type, street_name, limit = 50 } = params

  const filters: Record<string, string> = {}

  if (town) filters.town = town
  if (flat_type) filters.flat_type = flat_type
  if (street_name) filters.street_name = street_name.toUpperCase()

  const searchParams = new URLSearchParams({
    resource_id: HDB_RESOURCE_ID,
    limit: String(Math.min(Math.max(limit, 1), 200)),
    sort: "month desc",
  })

  if (Object.keys(filters).length > 0) {
    searchParams.set("filters", JSON.stringify(filters))
  }

  const response = await fetch(`https://data.gov.sg/api/action/datastore_search?${searchParams.toString()}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch HDB resale data: ${response.status}`)
  }

  const payload = await response.json()
  const records = payload?.result?.records ?? []

  return {
    total: payload?.result?._total ?? records.length,
    records: records as HdbResaleRecord[],
  }
}
