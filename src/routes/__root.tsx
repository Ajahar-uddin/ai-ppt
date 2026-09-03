import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import appCss from '../styles.css?url'

import { TooltipProvider } from '#/components/ui/tooltip'
import { Toaster } from '#/components/ui/toast'
import { ThemeProvider } from '#/providers/theme-provider'
import Navbar from '#/components/Navbar'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ai PPT | Create AI-powered presentations in seconds',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <TooltipProvider>
            <Navbar />
            <Outlet />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
