"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator } from "lucide-react"
import Link from "next/link"
import { calculateBSD } from "@/lib/utils"

export default function AddProperty() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "",
    purchase_price: "",
    purchase_date: "",
    stamp_duty: "",
    renovation_cost: "",
    agent_fees: "",
    current_value: "",
    cpf_amount: "",
    mortgage_amount: "",
    mortgage_interest_rate: "",
    mortgage_tenure: "",
    monthly_rental: "",
  })

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "purchase_price" && value) {
      const price = parseFloat(value)
      if (!isNaN(price)) {
        const bsd = calculateBSD(price)
        setFormData((prev) => ({
          ...prev,
          stamp_duty: bsd.toString(),
          current_value: prev.current_value || value,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          mortgage_tenure: parseInt(formData.mortgage_tenure) || 0,
          monthly_rental: parseFloat(formData.monthly_rental) || 0,
        }),
      })

      if (response.ok) {
        router.push("/")
      } else {
        const error = await response.json()
        alert("Error: " + error.message)
      }
    } catch (error) {
      console.error("Error adding property:", error)
      alert("An error occurred while adding the property")
    } finally {
      setLoading(false)
    }
  }

  const calculateStampDuty = () => {
    if (formData.purchase_price) {
      const price = parseFloat(formData.purchase_price)
      if (!isNaN(price)) {
        const bsd = calculateBSD(price)
        setFormData((prev) => ({
          ...prev,
          stamp_duty: bsd.toString(),
        }))
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Add Property</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Track a new Singapore property investment with complete financial details.</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the property.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="e.g., My HDB Flat" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} required>
                  <SelectTrigger id="type">
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
              <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Full property address" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
            <CardDescription>Information about your acquisition cost and timeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Purchase Price (SGD)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => handleInputChange("purchase_date", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <Label htmlFor="stamp_duty">Buyer&apos;s Stamp Duty (BSD)</Label>
                <Button type="button" variant="outline" size="sm" onClick={calculateStampDuty} disabled={!formData.purchase_price}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate
                </Button>
              </div>
              <Input id="stamp_duty" type="number" value={formData.stamp_duty} onChange={(e) => handleInputChange("stamp_duty", e.target.value)} placeholder="0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Costs</CardTitle>
            <CardDescription>All secondary costs tied to this property.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="renovation_cost">Renovation Cost (SGD)</Label>
                <Input id="renovation_cost" type="number" value={formData.renovation_cost} onChange={(e) => handleInputChange("renovation_cost", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent_fees">Agent Fees (SGD)</Label>
                <Input id="agent_fees" type="number" value={formData.agent_fees} onChange={(e) => handleInputChange("agent_fees", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <Label htmlFor="cpf_amount">CPF Amount Used (SGD)</Label>
                <Input id="cpf_amount" type="number" value={formData.cpf_amount} onChange={(e) => handleInputChange("cpf_amount", e.target.value)} placeholder="0" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mortgage Details</CardTitle>
            <CardDescription>Loan details for financing analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="mortgage_amount">Loan Amount (SGD)</Label>
              <Input id="mortgage_amount" type="number" value={formData.mortgage_amount} onChange={(e) => handleInputChange("mortgage_amount", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mortgage_interest_rate">Interest Rate (%)</Label>
              <Input
                id="mortgage_interest_rate"
                type="number"
                step="0.01"
                value={formData.mortgage_interest_rate}
                onChange={(e) => handleInputChange("mortgage_interest_rate", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mortgage_tenure">Tenure (Years)</Label>
              <Input id="mortgage_tenure" type="number" value={formData.mortgage_tenure} onChange={(e) => handleInputChange("mortgage_tenure", e.target.value)} placeholder="0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Valuation</CardTitle>
            <CardDescription>Estimated current market value of the property.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Market Value (SGD)</Label>
              <Input id="current_value" type="number" value={formData.current_value} onChange={(e) => handleInputChange("current_value", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_rental">Monthly Rental Income (SGD)</Label>
              <Input id="monthly_rental" type="number" value={formData.monthly_rental} onChange={(e) => handleInputChange("monthly_rental", e.target.value)} placeholder="0" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Adding Property..." : "Add Property"}
          </Button>
        </div>
      </form>
    </div>
  )
}
