import { AuthShell } from "@/components/auth/auth-shell"
import Link from "next/link";


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
        <Link href="/login" className="btn btn-primary rounded-full shadow-none">Back to Login</Link>
      </div>
    </AuthShell>
  )
}