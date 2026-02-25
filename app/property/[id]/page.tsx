"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Calculator, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import {
  formatCurrency,
  formatPercent,
  calculateNetProfit,
  calculateROI,
  calculateAnnualizedReturn,
  calculateTotalCost,
  calculateBreakEvenPrice,
  calculateSSD,
  calculateCPFAccruedInterest,
  getSSDCountdown,
  calculateMortgageInterestPaid
} from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  transactions: any[]
}

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentValue, setCurrentValue] = useState('')
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
        setCurrentValue(data.current_value?.toString() || data.purchase_price.toString())
      } else if (response.status === 404) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCurrentValue = async () => {
    if (!property || !currentValue) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...property,
          current_value: parseFloat(currentValue)
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setProperty(updated)
      }
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>
  }

  if (!property) {
    return <div className="text-center">Property not found</div>
  }

  const totalCost = calculateTotalCost(property)
  const netProfit = calculateNetProfit(property)
  const roi = calculateROI(property)
  const annualizedReturn = calculateAnnualizedReturn(property)
  const breakEvenPrice = calculateBreakEvenPrice(property)
  const ssdInfo = getSSDCountdown(property.purchase_date)
  const ssdAmount = calculateSSD(property.current_value || property.purchase_price, property.purchase_date)
  const cpfAccruedInterest = calculateCPFAccruedInterest(property.cpf_amount, property.purchase_date)
  const mortgageInterestPaid = calculateMortgageInterestPaid(
    property.mortgage_amount,
    property.mortgage_interest_rate,
    property.mortgage_tenure,
    property.purchase_date
  )

  // Generate projection data for chart
  const generateProjectionData = () => {
    const data = []
    const startDate = new Date(property.purchase_date)
    const currentDate = new Date()
    
    // Historical data point
    data.push({
      date: startDate.getFullYear().toString(),
      value: property.purchase_price,
      type: 'historical'
    })
    
    // Current data point
    data.push({
      date: currentDate.getFullYear().toString(),
      value: property.current_value || property.purchase_price,
      type: 'current'
    })

    // Future projections (5 years) with 3% annual growth
    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(currentDate.getFullYear() + i, 0, 1)
      const projectedValue = (property.current_value || property.purchase_price) * Math.pow(1.03, i)
      data.push({
        date: futureDate.getFullYear().toString(),
        value: projectedValue,
        type: 'projection'
      })
    }

    return data
  }

  const chartData = generateProjectionData()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-muted-foreground">{property.address}</p>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">Including all costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(property.current_value || property.purchase_price)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="text-xs border rounded px-2 py-1 w-24"
                placeholder="Update"
              />
              <Button
                size="sm"
                onClick={updateCurrentValue}
                disabled={updating}
                className="text-xs"
              >
                {updating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            {netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              ROI: {formatPercent(roi)} | Annual: {formatPercent(annualizedReturn)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break Even</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(breakEvenPrice)}</div>
            <p className="text-xs text-muted-foreground">Including SSD</p>
          </CardContent>
        </Card>
      </div>

      {/* SSD Status */}
      {!ssdInfo.isExempt && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Seller's Stamp Duty (SSD)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Rate</p>
                <p className="text-2xl font-bold text-amber-600">{ssdInfo.currentRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days to Next Tier</p>
                <p className="text-2xl font-bold">{ssdInfo.daysToNextTier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Rate</p>
                <p className="text-2xl font-bold text-green-600">{ssdInfo.nextRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SSD Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(ssdAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="font-semibold">{new Date(property.purchase_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Years Owned</p>
                    <p className="font-semibold">{ssdInfo.yearsOwned.toFixed(1)} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                    <p className="font-semibold">{formatCurrency(property.purchase_price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(property.purchase_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Stamp Duty</span>
                  <span className="font-semibold">{formatCurrency(property.stamp_duty)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Renovation</span>
                  <span className="font-semibold">{formatCurrency(property.renovation_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Agent Fees</span>
                  <span className="font-semibold">{formatCurrency(property.agent_fees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mortgage Interest (Paid)</span>
                  <span className="font-semibold">{formatCurrency(mortgageInterestPaid)}</span>
                </div>
                {property.cpf_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">CPF Accrued Interest</span>
                    <span className="font-semibold">{formatCurrency(cpfAccruedInterest)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Investment</span>
                    <span className="font-semibold">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Value</span>
                    <span className="font-semibold">{formatCurrency(property.current_value || property.purchase_price)}</span>
                  </div>
                  <div className={`flex justify-between ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="text-sm">Net Profit/Loss</span>
                    <span className="font-semibold">{formatCurrency(netProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ROI</span>
                    <span className="font-semibold">{formatPercent(roi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Annualized Return</span>
                    <span className="font-semibold">{formatPercent(annualizedReturn)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sell Now Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Selling Price</span>
                    <span className="font-semibold">{formatCurrency(property.current_value || property.purchase_price)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span className="text-sm">SSD ({ssdInfo.currentRate}%)</span>
                    <span className="font-semibold">-{formatCurrency(ssdAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span className="text-sm">Agent Fees (2%)</span>
                    <span className="font-semibold">-{formatCurrency((property.current_value || property.purchase_price) * 0.02)}</span>
                  </div>
                  {property.cpf_amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="text-sm">CPF + Interest</span>
                      <span className="font-semibold">-{formatCurrency(property.cpf_amount + cpfAccruedInterest)}</span>
                    </div>
                  )}
                  <hr />
                  <div className={`flex justify-between text-lg font-bold ${
                    ((property.current_value || property.purchase_price) - ssdAmount - ((property.current_value || property.purchase_price) * 0.02) - (property.cpf_amount + cpfAccruedInterest) - totalCost) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span>Net Proceeds</span>
                    <span>{formatCurrency(
                      (property.current_value || property.purchase_price) - 
                      ssdAmount - 
                      ((property.current_value || property.purchase_price) * 0.02) - 
                      (property.cpf_amount + cpfAccruedInterest) - 
                      totalCost
                    )}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Value Projection</CardTitle>
              <CardDescription>Historical, current, and projected property values (3% annual growth assumed)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All transactions related to this property</CardDescription>
            </CardHeader>
            <CardContent>
              {property.transactions && property.transactions.length > 0 ? (
                <div className="space-y-2">
                  {property.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.type}
                        </p>
                      </div>
                      <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}