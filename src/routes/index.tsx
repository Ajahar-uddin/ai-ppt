import Welcome from '#/components/welcome'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {

  return (
    <Welcome />
  )
}
