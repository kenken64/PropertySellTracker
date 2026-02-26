export interface MasRatesSnapshot {
  source: string
  last_updated: string
  rates: {
    sor_3m: number
    sora_1m: number
    sora_3m: number
    fixed_deposit_12m: number
    savings_reference: number
    estimated_home_loan_rate: number
  }
}

// MAS table source can be volatile for programmatic scraping; keeping a maintained snapshot.
const LATEST_RATES: MasRatesSnapshot = {
  source: "MAS Table of Rates Snapshot (maintained in app)",
  last_updated: "2026-02-26",
  rates: {
    sor_3m: 2.84,
    sora_1m: 2.91,
    sora_3m: 2.96,
    fixed_deposit_12m: 2.35,
    savings_reference: 0.15,
    estimated_home_loan_rate: 2.95,
  },
}

export async function getMasRates(): Promise<MasRatesSnapshot> {
  return LATEST_RATES
}
