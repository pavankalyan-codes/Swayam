/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'Swayam',
      },
      {
        name: 'description',
        content:
          'Swayam — Where families begin. Create a polished marriage biodata with live preview, photo upload, and print-ready PDF export.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f4ec] px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-stone-950">
          This biodata page does not exist.
        </h1>
        <a
          href="/"
          className="mt-6 inline-flex rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to maker
        </a>
      </div>
    </main>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
