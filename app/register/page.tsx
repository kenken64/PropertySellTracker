"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { getRegisterSchema } from "@/lib/validations"

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations("Auth")
  const tValidation = useTranslations("Validation")
  const registerSchema = getRegisterSchema((key) => tValidation(key))
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setConfirmPasswordError("")
    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
    })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }
    setErrors({})

    if (parsed.data.password !== confirmPassword) {
      setConfirmPasswordError(t("passwordMismatch"))
      return
    }

    setIsLoading(true)

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    })

    if (!registerResponse.ok) {
      const result = await registerResponse.json().catch(() => ({ error: t("registrationFailed") }))
      setIsLoading(false)
      setError(result.error || t("registrationFailed"))
      return
    }

    const signInResult = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })

    setIsLoading(false)

    if (signInResult?.error) {
      setError(t("autoLoginFailed"))
      router.push("/login")
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-md items-center py-8 sm:py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerDesc")}</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
              <PasswordInput id="confirm-password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {confirmPasswordError ? <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p> : null}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")} {" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
