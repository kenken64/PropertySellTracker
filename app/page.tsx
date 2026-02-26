"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, Clock, DollarSign, Eye, Plus, TrendingDown, TrendingUp } from "lucide-react"
import { formatCurrency, formatPercent, calculateNetProfit, calculateROI, calculateTotalCost, getSSDCountdown } from "@/lib/utils"
import { getMasRates, type MasRatesSnapshot } from "@/lib/mas-rates"

interface Property {
  id: number
  name: string
  address: string
  type: string
  purchase_price: number
  purchase_date: string
  current_value: number
  stamp_duty: number
  renovation_cost: number
  agent_fees: number
  mortgage_amount: number
  mortgage_interest_rate: number
  mortgage_tenure: number
  cpf_amount: number
  monthly_rental: number
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [masRates, setMasRates] = useState<MasRatesSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const t = useTranslations("Dashboard")
  const tNav = useTranslations("Navigation")

  useEffect(() => {
    fetchProperties()
    getMasRates().then(setMasRates)
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalInvestment = properties.reduce((sum, property) => sum + calculateTotalCost(property), 0)
  const totalCurrentValue = properties.reduce((sum, property) => sum + (property.current_value || property.purchase_price), 0)
  const totalProfit = totalCurrentValue - totalInvestment
  const mortgageProperties = properties.filter((property) => property.mortgage_amount > 0 && property.mortgage_interest_rate > 0)
  const weightedMortgageRate =
    mortgageProperties.reduce((sum, property) => sum + property.mortgage_interest_rate * property.mortgage_amount, 0) /
    Math.max(
      mortgageProperties.reduce((sum, property) => sum + property.mortgage_amount, 0),
      1
    )
  const marketRate = masRates?.rates.estimated_home_loan_rate || 0
  const isPayingAboveMarket = mortgageProperties.length > 0 && weightedMortgageRate > marketRate

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">{t("loading")}</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/add-property">
              <Plus className="mr-2 h-4 w-4" />
              {tNav("addProperty")}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalProperties")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalInvestment")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("currentValue")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("netPnL")}</CardTitle>
            {totalProfit >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "profit-positive" : "profit-negative"}`}>{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("masInterestRates")}</CardTitle>
            <CardDescription>{t("masSnapshot", { updated: masRates?.last_updated || t("loadingShort") })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{t("sor3m")}</p>
                <p className="mt-1 font-semibold">{masRates?.rates.sor_3m.toFixed(2) || "0.00"}%</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{t("sora1m")}</p>
                <p className="mt-1 font-semibold">{masRates?.rates.sora_1m.toFixed(2) || "0.00"}%</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{t("sora3m")}</p>
                <p className="mt-1 font-semibold">{masRates?.rates.sora_3m.toFixed(2) || "0.00"}%</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{t("fixedDeposit12m")}</p>
                <p className="mt-1 font-semibold">{masRates?.rates.fixed_deposit_12m.toFixed(2) || "0.00"}%</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{t("savingsReference")}</p>
                <p className="mt-1 font-semibold">{masRates?.rates.savings_reference.toFixed(2) || "0.00"}%</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{t("marketMortgageEst")}</p>
                <p className="mt-1 font-semibold">{marketRate.toFixed(2)}%</p>
              </div>
            </div>

            {mortgageProperties.length > 0 ? (
              <div className={`rounded-xl border p-3 text-sm ${isPayingAboveMarket ? "border-red-300/70 bg-red-50/60 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" : "border-emerald-300/70 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"}`}>
                <p className="font-semibold">{t("weightedMortgageRate", { rate: weightedMortgageRate.toFixed(2) })}</p>
                {isPayingAboveMarket ? (
                  <p className="mt-1 inline-flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {t("aboveMarketBy", { rate: (weightedMortgageRate - marketRate).toFixed(2) })}
                  </p>
                ) : (
                  <p className="mt-1">{t("atOrBelowMarket")}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noMortgageData")}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("yourProperties")}</h2>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t("noProperties")}</h3>
                  <p className="text-muted-foreground">{t("startTracking")}</p>
                </div>
                <Button asChild>
                  <Link href="/add-property">{t("addFirstProperty")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {properties.map((property) => {
              const netProfit = calculateNetProfit(property)
              const roi = calculateROI(property)
              const ssdInfo = getSSDCountdown(property.purchase_date)

              return (
                <Card key={property.id} className="h-full">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="truncate text-lg sm:text-xl">{property.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{property.address}</CardDescription>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{property.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("purchasedOn", { date: new Date(property.purchase_date).toLocaleDateString(locale) })}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">{t("purchase")}</p>
                        <p className="mt-1 font-semibold">{formatCurrency(property.purchase_price)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">{t("current")}</p>
                        <p className="mt-1 font-semibold">{formatCurrency(property.current_value || property.purchase_price)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">{t("netPnL")}</p>
                        <p className={`mt-1 font-semibold ${netProfit >= 0 ? "profit-positive" : "profit-negative"}`}>{formatCurrency(netProfit)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className={`mt-1 font-semibold ${roi >= 0 ? "profit-positive" : "profit-negative"}`}>{formatPercent(roi)}</p>
                      </div>
                    </div>

                    {!ssdInfo.isExempt && (
                      <div className="rounded-xl border border-amber-300/50 bg-amber-100/50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{t("ssdCountdown", { currentRate: ssdInfo.currentRate, days: ssdInfo.daysToNextTier, nextRate: ssdInfo.nextRate })}</span>
                        </div>
                      </div>
                    )}

                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/property/${property.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("viewDetails")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
