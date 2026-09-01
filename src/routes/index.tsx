import { Button } from '#/components/ui/button'
import { Card, CardTitle } from '#/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div>
      <Card>
        <CardTitle className="text-2xl">Welcome to TanStack Start</CardTitle>
        <Button variant="default" className="w-full">
          Get Started
        </Button>
      </Card>
    </div>
  )
}
