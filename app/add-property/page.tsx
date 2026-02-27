"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, Calculator } from "lucide-react"

import { AddressLookup } from "@/components/address-lookup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateBSD } from "@/lib/utils"
import { getCreatePropertySchema } from "@/lib/validations"

export default function AddProperty() {
  const router = useRouter()
  const t = useTranslations("AddProperty")
  const tNav = useTranslations("Navigation")
  const tCommon = useTranslations("Common")
  const tValidation = useTranslations("Validation")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    unit_no: "",
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
    target_profit_percentage: "",
  })

  const createPropertySchema = getCreatePropertySchema((key) => tValidation(key))

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = createPropertySchema.safeParse({
      name: formData.name,
      address: formData.address,
      unit_no: formData.unit_no,
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
      target_profit_percentage: parseFloat(formData.target_profit_percentage) || 0,
    })

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      })

      if (response.ok) {
        router.push("/")
      } else {
        const error = await response.json()
        alert(t("errorPrefix", { message: error.message }))
      }
    } catch (error) {
      console.error("Error adding property:", error)
      alert(t("addPropertyError"))
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInformation")}</CardTitle>
            <CardDescription>{t("basicInformationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("propertyName")}</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder={t("propertyNamePlaceholder")} />
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t("propertyType")}</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder={t("selectPropertyType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDB">HDB</SelectItem>
                    <SelectItem value="Condo">{t("condominium")}</SelectItem>
                    <SelectItem value="Landed">{t("landedProperty")}</SelectItem>
                    <SelectItem value="Commercial">{t("commercialProperty")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type ? <p className="mt-1 text-sm text-red-500">{errors.type[0]}</p> : null}
              </div>
            </div>

            <AddressLookup
              onSelect={(sgAddr) => {
                setFormData((prev) => ({ ...prev, address: sgAddr.fullAddress, unit_no: sgAddr.unitNo }))
              }}
              labels={{
                postalCode: t("postalCode") || "Postal Code",
                blockNo: t("blockNo") || "Block / House No.",
                streetName: t("streetName") || "Street Name",
                building: t("buildingName") || "Building Name",
                unitNo: t("unitNo") || "Unit No.",
              }}
              errors={{
                address: errors.address?.[0],
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("purchaseDetails")}</CardTitle>
            <CardDescription>{t("purchaseDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase_price">{t("purchasePrice")}</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                  placeholder="0"
                />
                {errors.purchase_price ? <p className="mt-1 text-sm text-red-500">{errors.purchase_price[0]}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">{t("purchaseDate")}</Label>
                <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => handleInputChange("purchase_date", e.target.value)} />
                {errors.purchase_date ? <p className="mt-1 text-sm text-red-500">{errors.purchase_date[0]}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <Label htmlFor="stamp_duty">{t("buyersStampDuty")}</Label>
                <Button type="button" variant="outline" size="sm" onClick={calculateStampDuty} disabled={!formData.purchase_price}>
                  <Calculator className="mr-2 h-4 w-4" />
                  {t("calculate")}
                </Button>
              </div>
              <Input id="stamp_duty" type="number" value={formData.stamp_duty} onChange={(e) => handleInputChange("stamp_duty", e.target.value)} placeholder="0" />
              {errors.stamp_duty ? <p className="mt-1 text-sm text-red-500">{errors.stamp_duty[0]}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("additionalCosts")}</CardTitle>
            <CardDescription>{t("additionalCostsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="renovation_cost">{t("renovationCost")}</Label>
                <Input id="renovation_cost" type="number" value={formData.renovation_cost} onChange={(e) => handleInputChange("renovation_cost", e.target.value)} placeholder="0" />
                {errors.renovation_cost ? <p className="mt-1 text-sm text-red-500">{errors.renovation_cost[0]}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent_fees">{t("agentFees")}</Label>
                <Input id="agent_fees" type="number" value={formData.agent_fees} onChange={(e) => handleInputChange("agent_fees", e.target.value)} placeholder="0" />
                {errors.agent_fees ? <p className="mt-1 text-sm text-red-500">{errors.agent_fees[0]}</p> : null}
              </div>
              <div className="space-y-2 lg:col-span-1">
                <Label htmlFor="cpf_amount">{t("cpfAmountUsed")}</Label>
                <Input id="cpf_amount" type="number" value={formData.cpf_amount} onChange={(e) => handleInputChange("cpf_amount", e.target.value)} placeholder="0" />
                {errors.cpf_amount ? <p className="mt-1 text-sm text-red-500">{errors.cpf_amount[0]}</p> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("mortgageDetails")}</CardTitle>
            <CardDescription>{t("mortgageDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="mortgage_amount">{t("loanAmount")}</Label>
              <Input id="mortgage_amount" type="number" value={formData.mortgage_amount} onChange={(e) => handleInputChange("mortgage_amount", e.target.value)} placeholder="0" />
              {errors.mortgage_amount ? <p className="mt-1 text-sm text-red-500">{errors.mortgage_amount[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mortgage_interest_rate">{t("interestRate")}</Label>
              <Input
                id="mortgage_interest_rate"
                type="number"
                step="0.01"
                value={formData.mortgage_interest_rate}
                onChange={(e) => handleInputChange("mortgage_interest_rate", e.target.value)}
                placeholder="0.00"
              />
              {errors.mortgage_interest_rate ? <p className="mt-1 text-sm text-red-500">{errors.mortgage_interest_rate[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mortgage_tenure">{t("tenure")}</Label>
              <Input id="mortgage_tenure" type="number" value={formData.mortgage_tenure} onChange={(e) => handleInputChange("mortgage_tenure", e.target.value)} placeholder="0" />
              {errors.mortgage_tenure ? <p className="mt-1 text-sm text-red-500">{errors.mortgage_tenure[0]}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("currentValuation")}</CardTitle>
            <CardDescription>{t("currentValuationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_value">{t("currentMarketValue")}</Label>
              <Input id="current_value" type="number" value={formData.current_value} onChange={(e) => handleInputChange("current_value", e.target.value)} placeholder="0" />
              {errors.current_value ? <p className="mt-1 text-sm text-red-500">{errors.current_value[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_rental">{t("monthlyRentalIncome")}</Label>
              <Input id="monthly_rental" type="number" value={formData.monthly_rental} onChange={(e) => handleInputChange("monthly_rental", e.target.value)} placeholder="0" />
              {errors.monthly_rental ? <p className="mt-1 text-sm text-red-500">{errors.monthly_rental[0]}</p> : null}
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="target_profit_percentage">{t("targetProfitAlert")}</Label>
              <Input
                id="target_profit_percentage"
                type="number"
                step="0.01"
                value={formData.target_profit_percentage}
                onChange={(e) => handleInputChange("target_profit_percentage", e.target.value)}
                placeholder="0"
              />
              {errors.target_profit_percentage ? <p className="mt-1 text-sm text-red-500">{errors.target_profit_percentage[0]}</p> : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/">{tCommon("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? t("addingProperty") : tNav("addProperty")}
          </Button>
        </div>
      </form>
    </div>
  )
}
