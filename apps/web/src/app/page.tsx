import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative flex place-items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Trésorerie</h1>
      </div>
      <p className="text-gray-500 mb-12 text-center max-w-md">
        Une application de gestion de trésorerie résiliente
      </p>

      <SignedIn>
        <div className="grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-1 lg:text-left">
          <Link
            href="/dashboard"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Tableau de bord{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Accéder au tableau de bord employé
            </p>
          </Link>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            S&apos;inscrire
          </Link>
        </div>
      </SignedOut>
    </main>
  )
}
