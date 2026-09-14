import { AuthShell } from "@/components/auth/auth-shell"
import { Button, Card } from "@/components/ui";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const email = params.email ?? null;
  const description = `If you have an active account with Medimate, a reset password link has been emailed${email ? ` to ${email}.` : "."}`

  return (
    <AuthShell title="Please check your email" description={description}>
      <div className="flex justify-center">
        <Button variant="accent" className="rounded-full shadow-none">Back to Login</Button>
      </div>
    </AuthShell>
  )
}