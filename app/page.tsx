"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Eye, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import {
  formatCurrency,
  formatPercent,
  calculateNetProfit,
  calculateROI,
  calculateTotalCost,
  getSSDCountdown
} from '@/lib/utils'

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
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalInvestment = properties.reduce((sum, property) => sum + calculateTotalCost(property), 0)
  const totalCurrentValue = properties.reduce((sum, property) => sum + (property.current_value || property.purchase_price), 0)
  const totalProfit = totalCurrentValue - totalInvestment

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Property Dashboard</h1>
          <p className="text-muted-foreground">Overview of your Singapore property investments</p>
        </div>
        <Button asChild>
          <Link href="/add-property">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
              {formatCurrency(totalProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Properties</h2>
        
        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No properties yet</h3>
                  <p className="text-muted-foreground">Start tracking your Singapore property investments</p>
                </div>
                <Button asChild>
                  <Link href="/add-property">Add Your First Property</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {properties.map((property) => {
              const netProfit = calculateNetProfit(property)
              const roi = calculateROI(property)
              const ssdInfo = getSSDCountdown(property.purchase_date)
              
              return (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                        <CardDescription>{property.address}</CardDescription>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {property.type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Purchased: {new Date(property.purchase_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/property/${property.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                        <p className="font-semibold">{formatCurrency(property.purchase_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="font-semibold">{formatCurrency(property.current_value || property.purchase_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Net P&L</p>
                        <p className={`font-semibold ${netProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                          {formatCurrency(netProfit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className={`font-semibold ${roi >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                          {formatPercent(roi)}
                        </p>
                      </div>
                    </div>
                    
                    {!ssdInfo.isExempt && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">
                            SSD: {ssdInfo.currentRate}% ({ssdInfo.daysToNextTier} days to {ssdInfo.nextRate}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}