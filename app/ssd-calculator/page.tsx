"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Info, Clock, TrendingDown } from 'lucide-react'
import {
  formatCurrency,
  formatPercent,
  calculateSSD,
  getSSDCountdown
} from '@/lib/utils'

export default function SSDCalculator() {
  const [propertyPrice, setPropertyPrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [result, setResult] = useState<{
    ssd: number
    ssdInfo: any
    netProceeds: number
  } | null>(null)

  const calculate = () => {
    if (!propertyPrice || !purchaseDate) return

    const price = parseFloat(propertyPrice)
    const ssd = calculateSSD(price, purchaseDate)
    const ssdInfo = getSSDCountdown(purchaseDate)
    const agentFees = price * 0.02 // Assume 2% agent fees
    const netProceeds = price - ssd - agentFees

    setResult({
      ssd,
      ssdInfo,
      netProceeds
    })
  }

  const clear = () => {
    setPropertyPrice('')
    setPurchaseDate('')
    setResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SSD Calculator</h1>
        <p className="text-muted-foreground">Calculate Singapore Seller's Stamp Duty for your property</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Calculate SSD</span>
            </CardTitle>
            <CardDescription>Enter your property details to calculate SSD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Property Selling Price (SGD)</Label>
              <Input
                id="price"
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(e.target.value)}
                placeholder="e.g., 800000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-date">Original Purchase Date</Label>
              <Input
                id="purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={calculate} disabled={!propertyPrice || !purchaseDate}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate SSD
              </Button>
              <Button variant="outline" onClick={clear}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SSD Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>SSD Rates in Singapore</span>
            </CardTitle>
            <CardDescription>Understanding Seller's Stamp Duty rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">12%</div>
                  <div className="text-sm text-muted-foreground">1st Year</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">8%</div>
                  <div className="text-sm text-muted-foreground">2nd Year</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">4%</div>
                  <div className="text-sm text-muted-foreground">3rd Year</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0%</div>
                  <div className="text-sm text-muted-foreground">4+ Years</div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• SSD applies to residential properties</p>
                <p>• Calculated on the selling price or market value (whichever is higher)</p>
                <p>• 3 years minimum holding period to avoid SSD</p>
                <p>• Different rules may apply for different property types and buyer profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Calculation Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSD Amount</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(result.ssd)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(result.ssdInfo.currentRate)} of selling price
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days to Lower Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.ssdInfo.isExempt ? 'Exempt' : result.ssdInfo.daysToNextTier}
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.ssdInfo.isExempt 
                    ? 'No SSD required' 
                    : `Next rate: ${result.ssdInfo.nextRate}%`
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Net Proceeds</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(result.netProceeds)}</div>
                <p className="text-xs text-muted-foreground">
                  After SSD and 2% agent fees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
              <CardDescription>Detailed calculation of selling costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Selling Price</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(propertyPrice))}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="text-sm">SSD ({formatPercent(result.ssdInfo.currentRate)})</span>
                  <span className="font-semibold">-{formatCurrency(result.ssd)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="text-sm">Agent Fees (2%)</span>
                  <span className="font-semibold">-{formatCurrency(parseFloat(propertyPrice) * 0.02)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Estimated Net Proceeds</span>
                  <span>{formatCurrency(result.netProceeds)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          {!result.ssdInfo.isExempt && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>SSD Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Years Owned</div>
                    <div className="text-xl font-bold">{result.ssdInfo.yearsOwned.toFixed(1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Current Rate</div>
                    <div className="text-xl font-bold text-red-600">{formatPercent(result.ssdInfo.currentRate)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Days to Next Tier</div>
                    <div className="text-xl font-bold">{result.ssdInfo.daysToNextTier}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Next Rate</div>
                    <div className="text-xl font-bold text-green-600">{formatPercent(result.ssdInfo.nextRate)}</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <p className="text-sm">
                    💡 <strong>Tip:</strong> Waiting {result.ssdInfo.daysToNextTier} more days could save you{' '}
                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        parseFloat(propertyPrice) * (result.ssdInfo.currentRate - result.ssdInfo.nextRate) / 100
                      )}
                    </span>{' '}
                    in SSD.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This calculator provides estimates only. SSD rates and calculations may vary based on specific circumstances, property types, and current regulations. For accurate calculations and tax advice, please consult with a qualified tax professional or refer to IRAS official guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}