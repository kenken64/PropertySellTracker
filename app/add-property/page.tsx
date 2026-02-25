"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Calculator } from 'lucide-react'
import Link from 'next/link'
import { calculateBSD } from '@/lib/utils'

export default function AddProperty() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    purchase_price: '',
    purchase_date: '',
    stamp_duty: '',
    renovation_cost: '',
    agent_fees: '',
    current_value: '',
    cpf_amount: '',
    mortgage_amount: '',
    mortgage_interest_rate: '',
    mortgage_tenure: ''
  })

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-calculate stamp duty when purchase price changes
    if (name === 'purchase_price' && value) {
      const price = parseFloat(value)
      if (!isNaN(price)) {
        const bsd = calculateBSD(price)
        setFormData(prev => ({
          ...prev,
          stamp_duty: bsd.toString(),
          current_value: prev.current_value || value // Set current value to purchase price if not set
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          type: formData.type,
          purchase_price: parseFloat(formData.purchase_price),
          purchase_date: formData.purchase_date,
          stamp_duty: parseFloat(formData.stamp_duty) || 0,
          renovation_cost: parseFloat(formData.renovation_cost) || 0,
          agent_fees: parseFloat(formData.agent_fees) || 0,
          current_value: parseFloat(formData.current_value) || parseFloat(formData.purchase_price),
          cpf_amount: parseFloat(formData.cpf_amount) || 0,
          mortgage_amount: parseFloat(formData.mortgage_amount) || 0,
          mortgage_interest_rate: parseFloat(formData.mortgage_interest_rate) || 0,
          mortgage_tenure: parseInt(formData.mortgage_tenure) || 0
        })
      })

      if (response.ok) {
        router.push('/')
      } else {
        const error = await response.json()
        alert('Error: ' + error.message)
      }
    } catch (error) {
      console.error('Error adding property:', error)
      alert('An error occurred while adding the property')
    } finally {
      setLoading(false)
    }
  }

  const calculateStampDuty = () => {
    if (formData.purchase_price) {
      const price = parseFloat(formData.purchase_price)
      if (!isNaN(price)) {
        const bsd = calculateBSD(price)
        setFormData(prev => ({
          ...prev,
          stamp_duty: bsd.toString()
        }))
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Property</h1>
          <p className="text-muted-foreground">Track a new Singapore property investment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the property</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., My HDB Flat"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDB">HDB</SelectItem>
                    <SelectItem value="Condo">Condominium</SelectItem>
                    <SelectItem value="Landed">Landed Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full property address"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
            <CardDescription>Information about the property purchase</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Purchase Price (SGD)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stamp_duty">Buyer's Stamp Duty (BSD)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={calculateStampDuty}
                  disabled={!formData.purchase_price}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </div>
              <Input
                id="stamp_duty"
                type="number"
                value={formData.stamp_duty}
                onChange={(e) => handleInputChange('stamp_duty', e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Costs</CardTitle>
            <CardDescription>Other expenses related to the property</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="renovation_cost">Renovation Cost (SGD)</Label>
                <Input
                  id="renovation_cost"
                  type="number"
                  value={formData.renovation_cost}
                  onChange={(e) => handleInputChange('renovation_cost', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent_fees">Agent Fees (SGD)</Label>
                <Input
                  id="agent_fees"
                  type="number"
                  value={formData.agent_fees}
                  onChange={(e) => handleInputChange('agent_fees', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf_amount">CPF Amount Used (SGD)</Label>
              <Input
                id="cpf_amount"
                type="number"
                value={formData.cpf_amount}
                onChange={(e) => handleInputChange('cpf_amount', e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mortgage Details</CardTitle>
            <CardDescription>Home loan information (if applicable)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mortgage_amount">Loan Amount (SGD)</Label>
                <Input
                  id="mortgage_amount"
                  type="number"
                  value={formData.mortgage_amount}
                  onChange={(e) => handleInputChange('mortgage_amount', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mortgage_interest_rate">Interest Rate (%)</Label>
                <Input
                  id="mortgage_interest_rate"
                  type="number"
                  step="0.01"
                  value={formData.mortgage_interest_rate}
                  onChange={(e) => handleInputChange('mortgage_interest_rate', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mortgage_tenure">Tenure (Years)</Label>
                <Input
                  id="mortgage_tenure"
                  type="number"
                  value={formData.mortgage_tenure}
                  onChange={(e) => handleInputChange('mortgage_tenure', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Valuation</CardTitle>
            <CardDescription>Estimated current market value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Market Value (SGD)</Label>
              <Input
                id="current_value"
                type="number"
                value={formData.current_value}
                onChange={(e) => handleInputChange('current_value', e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding Property...' : 'Add Property'}
          </Button>
        </div>
      </form>
    </div>
  )
}