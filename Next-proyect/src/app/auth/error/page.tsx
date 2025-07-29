import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import {use} from "react"

type Params = Promise<{ message: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


export default function AuthErrorPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = use(props.params)
  const searchParams = use(props.searchParams)
  const message = params.message
  const query = searchParams.query

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">Error de Autenticación</h1>
          </div>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>¡Algo salió mal!</AlertTitle>
            <AlertDescription className="mt-2">
              {message || query}
            </AlertDescription>
          </Alert>

          <div className="mt-4 text-sm text-gray-600">
            <p>Por favor, verifica tus credenciales e intenta nuevamente.</p>
            <p className="mt-2">Si el problema persiste, contacta al soporte técnico.</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild className="flex items-center gap-2">
            <a href="/auth/login">
              <Home className="h-4 w-4" />
              Reintentar login
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}