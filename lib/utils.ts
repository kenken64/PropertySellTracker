import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMonths, differenceInDays, differenceInYears, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface RefinanceRecord {
  id: number
  property_id: number
  refinance_date: string
  loan_amount: number
  interest_rate: number
  tenure: number
  description: string
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

// Singapore BSD (Buyer's Stamp Duty) calculation
export function calculateBSD(propertyPrice: number): number {
  let bsd = 0

  if (propertyPrice <= 180000) {
    bsd = propertyPrice * 0.01
  } else if (propertyPrice <= 360000) {
    bsd = 180000 * 0.01 + (propertyPrice - 180000) * 0.02
  } else if (propertyPrice <= 1000000) {
    bsd = 180000 * 0.01 + 180000 * 0.02 + (propertyPrice - 360000) * 0.03
  } else {
    bsd = 180000 * 0.01 + 180000 * 0.02 + 640000 * 0.03 + (propertyPrice - 1000000) * 0.04
  }

  return bsd
}

// Singapore SSD (Seller's Stamp Duty) calculation
export function calculateSSD(propertyPrice: number, purchaseDate: string): number {
  const yearsOwned = differenceInYears(new Date(), parseISO(purchaseDate))

  if (yearsOwned >= 3) return 0

  let ssdRate = 0
  if (yearsOwned < 1) {
    ssdRate = 0.12 // 12%
  } else if (yearsOwned < 2) {
    ssdRate = 0.08 // 8%
  } else if (yearsOwned < 3) {
    ssdRate = 0.04 // 4%
  }

  return propertyPrice * ssdRate
}

// Get SSD countdown
export function getSSDCountdown(purchaseDate: string): {
  yearsOwned: number
  daysToNextTier: number
  currentRate: number
  nextRate: number
  isExempt: boolean
} {
  const now = new Date()
  const purchase = parseISO(purchaseDate)
  const yearsOwned = differenceInYears(now, purchase)
  const daysSincePurchase = differenceInDays(now, purchase)

  if (yearsOwned >= 3) {
    return {
      yearsOwned,
      daysToNextTier: 0,
      currentRate: 0,
      nextRate: 0,
      isExempt: true,
    }
  }

  let currentRate = 0
  let nextRate = 0
  let daysToNextTier = 0

  if (daysSincePurchase < 365) {
    currentRate = 12
    nextRate = 8
    daysToNextTier = 365 - daysSincePurchase
  } else if (daysSincePurchase < 730) {
    currentRate = 8
    nextRate = 4
    daysToNextTier = 730 - daysSincePurchase
  } else if (daysSincePurchase < 1095) {
    currentRate = 4
    nextRate = 0
    daysToNextTier = 1095 - daysSincePurchase
  }

  return {
    yearsOwned,
    daysToNextTier,
    currentRate,
    nextRate,
    isExempt: false,
  }
}

export function getSSDFreeDate(purchaseDate: string): Date {
  return addMonths(parseISO(purchaseDate), 36)
}

export function getDaysToSSDFree(purchaseDate: string): number {
  return differenceInDays(getSSDFreeDate(purchaseDate), new Date())
}

// Calculate mortgage interest paid to date
export function calculateMortgageInterestPaid(
  loanAmount: number,
  interestRate: number,
  tenureYears: number,
  startDate: string
): number {
  if (loanAmount === 0 || interestRate === 0) return 0

  const monthsElapsed = differenceInDays(new Date(), parseISO(startDate)) / 30.44 // Average days per month
  const monthlyRate = interestRate / 100 / 12
  const totalMonths = tenureYears * 12

  if (monthsElapsed <= 0) return 0
  if (monthsElapsed >= totalMonths) {
    // Loan completed, calculate total interest
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    return monthlyPayment * totalMonths - loanAmount
  }

  // Calculate interest paid to date
  let remainingBalance = loanAmount
  let totalInterestPaid = 0

  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)

  for (let month = 1; month <= Math.min(monthsElapsed, totalMonths); month++) {
    const interestPayment = remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment

    totalInterestPaid += interestPayment
    remainingBalance -= principalPayment
  }

  return totalInterestPaid
}

// Calculate mortgage interest for a specific time segment
function calculateSegmentInterest(
  loanAmount: number,
  interestRate: number,
  tenureYears: number,
  startDate: string,
  endDate: Date
): number {
  if (loanAmount === 0 || interestRate === 0) return 0

  const monthsElapsed = differenceInDays(endDate, parseISO(startDate)) / 30.44
  const monthlyRate = interestRate / 100 / 12
  const totalMonths = tenureYears * 12

  if (monthsElapsed <= 0) return 0
  if (monthsElapsed >= totalMonths) {
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    return monthlyPayment * totalMonths - loanAmount
  }

  let remainingBalance = loanAmount
  let totalInterestPaid = 0
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)

  for (let month = 1; month <= Math.min(monthsElapsed, totalMonths); month++) {
    const interestPayment = remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    totalInterestPaid += interestPayment
    remainingBalance -= principalPayment
  }

  return totalInterestPaid
}

// Calculate mortgage interest with refinances — builds time segments and sums interest
export function calculateMortgageInterestPaidWithRefinances(
  originalLoan: number,
  originalRate: number,
  originalTenure: number,
  purchaseDate: string,
  refinances: RefinanceRecord[] = []
): number {
  if (refinances.length === 0) {
    return calculateMortgageInterestPaid(originalLoan, originalRate, originalTenure, purchaseDate)
  }

  const now = new Date()
  const sorted = [...refinances].sort((a, b) => a.refinance_date.localeCompare(b.refinance_date))

  let totalInterest = 0

  // Original mortgage period: purchase_date → first refinance date
  const firstRefiDate = parseISO(sorted[0].refinance_date)
  totalInterest += calculateSegmentInterest(originalLoan, originalRate, originalTenure, purchaseDate, firstRefiDate)

  // Each refinance period
  for (let i = 0; i < sorted.length; i++) {
    const refi = sorted[i]
    const endDate = i < sorted.length - 1 ? parseISO(sorted[i + 1].refinance_date) : now
    totalInterest += calculateSegmentInterest(refi.loan_amount, refi.interest_rate, refi.tenure, refi.refinance_date, endDate)
  }

  return totalInterest
}

// Calculate CPF accrued interest at 2.5%
export function calculateCPFAccruedInterest(cpfAmount: number, purchaseDate: string): number {
  if (cpfAmount === 0) return 0

  const years = differenceInDays(new Date(), parseISO(purchaseDate)) / 365.25
  return cpfAmount * Math.pow(1.025, years) - cpfAmount
}

// Calculate total cost of property
export function calculateTotalCost(property: any, refinances: RefinanceRecord[] = []): number {
  const mortgageInterestPaid = refinances.length > 0
    ? calculateMortgageInterestPaidWithRefinances(
        property.mortgage_amount,
        property.mortgage_interest_rate,
        property.mortgage_tenure,
        property.purchase_date,
        refinances
      )
    : calculateMortgageInterestPaid(
        property.mortgage_amount,
        property.mortgage_interest_rate,
        property.mortgage_tenure,
        property.purchase_date
      )

  return property.purchase_price + property.stamp_duty + property.renovation_cost + property.agent_fees + mortgageInterestPaid
}

// Calculate net profit/loss
export function calculateNetProfit(property: any, refinances: RefinanceRecord[] = []): number {
  const totalCost = calculateTotalCost(property, refinances)
  const currentValue = property.current_value || property.purchase_price
  const cpfAccruedInterest = calculateCPFAccruedInterest(property.cpf_amount, property.purchase_date)

  return currentValue - totalCost - cpfAccruedInterest
}

// Calculate ROI percentage
export function calculateROI(property: any, refinances: RefinanceRecord[] = []): number {
  const totalCost = calculateTotalCost(property, refinances)
  const netProfit = calculateNetProfit(property, refinances)

  if (totalCost === 0) return 0
  return (netProfit / totalCost) * 100
}

// Calculate annualized return
export function calculateAnnualizedReturn(property: any, refinances: RefinanceRecord[] = []): number {
  const years = differenceInDays(new Date(), parseISO(property.purchase_date)) / 365.25
  const roi = calculateROI(property, refinances)

  if (years <= 0) return 0
  return Math.pow(1 + roi / 100, 1 / years) * 100 - 100
}

// Calculate break-even price
export function calculateBreakEvenPrice(property: any, refinances: RefinanceRecord[] = []): number {
  const totalCost = calculateTotalCost(property, refinances)
  const cpfAccruedInterest = calculateCPFAccruedInterest(property.cpf_amount, property.purchase_date)
  const ssd = calculateSSD(totalCost + cpfAccruedInterest, property.purchase_date)

  return totalCost + cpfAccruedInterest + ssd
}

export function calculateGrossYield(monthlyRental: number, currentValue: number): number {
  if (!currentValue || currentValue <= 0) return 0
  return (monthlyRental * 12 * 100) / currentValue
}

export function calculateNetYield(monthlyRental: number, currentValue: number, annualExpenses: number): number {
  if (!currentValue || currentValue <= 0) return 0
  return ((monthlyRental * 12 - annualExpenses) * 100) / currentValue
}

function getSSDRateAtSale(purchaseDate: string, holdMonths = 0): number {
  const saleDate = addMonths(new Date(), holdMonths)
  const daysOwnedAtSale = differenceInDays(saleDate, parseISO(purchaseDate))

  if (daysOwnedAtSale >= 1095) return 0
  if (daysOwnedAtSale >= 730) return 4
  if (daysOwnedAtSale >= 365) return 8
  return 12
}

function getCpfRefundAtSale(cpfAmount: number, purchaseDate: string, holdMonths = 0): number {
  if (!cpfAmount || cpfAmount <= 0) return 0

  const saleDate = addMonths(new Date(), holdMonths)
  const years = differenceInDays(saleDate, parseISO(purchaseDate)) / 365.25
  return cpfAmount * Math.pow(1.025, years)
}

function estimateAdditionalMortgageInterest(property: any, holdMonths: number, refinances: RefinanceRecord[] = []): number {
  let loanAmount = property.mortgage_amount
  let rate = property.mortgage_interest_rate

  if (refinances.length > 0) {
    const sorted = [...refinances].sort((a, b) => a.refinance_date.localeCompare(b.refinance_date))
    const latest = sorted[sorted.length - 1]
    loanAmount = latest.loan_amount
    rate = latest.interest_rate
  }

  if (!loanAmount || !rate || holdMonths <= 0) return 0
  return loanAmount * (rate / 100) * (holdMonths / 12)
}

export function calculateSellNowProceeds(property: any, refinances: RefinanceRecord[] = []): number {
  const salePrice = property.current_value || property.purchase_price
  const totalCosts = calculateTotalCost(property, refinances)
  const ssd = calculateSSD(salePrice, property.purchase_date)
  const cpfRefund = getCpfRefundAtSale(property.cpf_amount, property.purchase_date, 0)

  return salePrice - totalCosts - ssd - cpfRefund
}

export function calculateHoldProceeds(property: any, holdMonths: number, appreciationRate: number, refinances: RefinanceRecord[] = []): number {
  const currentValue = property.current_value || property.purchase_price
  const projectedValue = currentValue * Math.pow(1 + appreciationRate / 100, holdMonths / 12)
  const totalCosts = calculateTotalCost(property, refinances)
  const ssdRate = getSSDRateAtSale(property.purchase_date, holdMonths)
  const ssd = projectedValue * (ssdRate / 100)
  const cpfRefund = getCpfRefundAtSale(property.cpf_amount, property.purchase_date, holdMonths)
  const additionalMortgageInterest = estimateAdditionalMortgageInterest(property, holdMonths, refinances)

  const sellNowProceeds = calculateSellNowProceeds(property, refinances)
  const opportunityCost = Math.max(sellNowProceeds, 0) * 0.03 * (holdMonths / 12)

  return projectedValue - totalCosts - additionalMortgageInterest - ssd - cpfRefund - opportunityCost
}

export function getSellRecommendation(property: any, refinances: RefinanceRecord[] = []): {
  message: string
  bestScenario: string
  holdMonths: number
  additionalProceeds: number
} {
  const nowProceeds = calculateSellNowProceeds(property, refinances)
  const oneYearProceeds = calculateHoldProceeds(property, 12, 3, refinances)
  const twoYearProceeds = calculateHoldProceeds(property, 24, 3, refinances)

  const daysToSsdFree = Math.max(0, 1095 - differenceInDays(new Date(), parseISO(property.purchase_date)))
  const monthsToSsdFree = Math.ceil(daysToSsdFree / 30.44)
  const ssdFreeProceeds = calculateHoldProceeds(property, monthsToSsdFree, 3, refinances)

  const scenarios = [
    { label: "Sell now", holdMonths: 0, proceeds: nowProceeds },
    { label: "Hold 1 year", holdMonths: 12, proceeds: oneYearProceeds },
    { label: "Hold 2 years", holdMonths: 24, proceeds: twoYearProceeds },
    { label: "Hold until SSD-free", holdMonths: monthsToSsdFree, proceeds: ssdFreeProceeds },
  ]

  const bestScenario = scenarios.reduce((best, current) => (current.proceeds > best.proceeds ? current : best), scenarios[0])

  if (bestScenario.holdMonths === 0) {
    return {
      message: "Recommended: Sell now",
      bestScenario: bestScenario.label,
      holdMonths: 0,
      additionalProceeds: 0,
    }
  }

  const additionalProceeds = bestScenario.proceeds - nowProceeds

  return {
    message: `Recommended: Hold ${bestScenario.holdMonths} more months to save ${formatCurrency(additionalProceeds)} in SSD-adjusted proceeds`,
    bestScenario: bestScenario.label,
    holdMonths: bestScenario.holdMonths,
    additionalProceeds,
  }
}
