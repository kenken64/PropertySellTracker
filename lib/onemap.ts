// OneMap Singapore API integration
// Docs: https://www.onemap.gov.sg/apidocs/

let cachedToken: { token: string; expiry: number } | null = null

async function getOneMapToken(): Promise<string | null> {
  const email = process.env.ONEMAP_EMAIL
  const password = process.env.ONEMAP_PASSWORD

  if (!email || !password) {
    return null
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < cachedToken.expiry - 300_000) {
    return cachedToken.token
  }

  try {
    const res = await fetch("https://www.onemap.gov.sg/api/auth/post/getToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (data.access_token) {
      cachedToken = {
        token: data.access_token,
        expiry: new Date(data.expiry_timestamp).getTime(),
      }
      return data.access_token
    }
    return null
  } catch {
    return null
  }
}

export interface OneMapResult {
  SEARCHVAL: string
  BLK_NO: string
  ROAD_NAME: string
  BUILDING: string
  ADDRESS: string
  POSTAL: string
  LATITUDE: string
  LONGITUDE: string
}

export interface AddressSearchResult {
  address: string
  postalCode: string
  blockNo: string
  roadName: string
  building: string
  latitude: string
  longitude: string
}

export async function searchByPostalCode(postalCode: string): Promise<AddressSearchResult[]> {
  const token = await getOneMapToken()

  if (!token) {
    return []
  }

  try {
    const res = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(postalCode)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`,
      {
        headers: { Authorization: token },
      }
    )

    if (!res.ok) return []

    const data = await res.json()

    if (!data.results || data.results.length === 0) return []

    return data.results.map((r: OneMapResult) => ({
      address: r.ADDRESS,
      postalCode: r.POSTAL,
      blockNo: r.BLK_NO,
      roadName: r.ROAD_NAME,
      building: r.BUILDING,
      latitude: r.LATITUDE,
      longitude: r.LONGITUDE,
    }))
  } catch {
    return []
  }
}

export async function searchAddress(query: string): Promise<AddressSearchResult[]> {
  const token = await getOneMapToken()

  if (!token) {
    return []
  }

  try {
    const res = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`,
      {
        headers: { Authorization: token },
      }
    )

    if (!res.ok) return []

    const data = await res.json()

    if (!data.results || data.results.length === 0) return []

    return data.results
      .slice(0, 10)
      .map((r: OneMapResult) => ({
        address: r.ADDRESS,
        postalCode: r.POSTAL,
        blockNo: r.BLK_NO,
        roadName: r.ROAD_NAME,
        building: r.BUILDING,
        latitude: r.LATITUDE,
        longitude: r.LONGITUDE,
      }))
  } catch {
    return []
  }
}
