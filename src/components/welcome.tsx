import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { toast } from '#/components/ui/toast'
import { authClient, useSession } from '#/lib/auth-client'

import { useNavigate } from '@tanstack/react-router'
export default function Welcome() {
  const nagivate = useNavigate()
  const { data } = useSession()
  const logout = async () => {
    try {
      await authClient.signOut()
      toast.add({
        type: 'success',
        title: 'Logout Successful',
        description: 'You have been logged out successfully.',
      })
      nagivate({
        to: '/login',
      })
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Logout Failed',
        description: 'Failed to log out.',
      })
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome {data?.user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a simple example of using TanStack Start with Better Auth.
          </p>
          <p className="text-muted-foreground">
            You are logged in as
            <span className="font-semibold ml-1">{data?.user?.email}</span>
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button onClick={logout} className="w-full">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
