import { ImportClient } from './components/ImportClient'
import { tourSteps } from '@/lib/tour-constants'
import { getPayload } from '@/lib/payload/getPayload'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Import Transactions | Miru',
  description: 'Bulk import your transactions via CSV.',
}

export default async function ImportPage() {
  const payload = await getPayload()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  let tutorialUrl = 'https://www.youtube.com/watch?v=10XdeMVqK6Q'
  let hasCompletedImportTour = false

  if (user && 'hasCompletedImportTour' in user) {
    hasCompletedImportTour = user.hasCompletedImportTour as boolean
  }

  try {
    const settings = await payload.findGlobal({
      slug: 'import-settings' as any,
    })
    if (settings && typeof settings === 'object' && 'tutorialUrl' in settings) {
      tutorialUrl = settings.tutorialUrl as string
    }
  } catch (error) {
    console.error('Failed to fetch import settings payload global', error)
  }

  return (
    <div className="flex flex-col gap-6" data-tour-step-id={tourSteps.importTutorial}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Import</h1>
        <p className="text-muted-foreground">
          Upload a CSV file to import multiple past transactions instantly.
        </p>
      </div>

      <div className="flex flex-col gap-2 bg-muted/50 p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold">¿Cómo formatear tu CSV? (Magic AI Prompt)</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Copia y pega este mensaje en ChatGPT o Claude junto con los datos crudos de tu banco para obtener un CSV perfecto listo para importar:
        </p>
        <div className="relative">
          <pre className="p-4 bg-background border border-border rounded text-sm text-foreground overflow-x-auto whitespace-pre-wrap">
            Actúa como un asistente financiero. Tengo estos datos bancarios en bruto. Por favor, conviértelos a un formato CSV estricto con los siguientes encabezados exactos: Date,Description,Amount,Type,CategoryName,AccountName. Reglas: 1. 'Date' debe ser YYYY-MM-DD. 2. 'Amount' debe ser un número decimal positivo sin símbolos de moneda. 3. 'Type' solo puede ser 'income' o 'expense'. 4. Asigna un 'CategoryName' lógico de 1 o 2 palabras en español. 5. 'AccountName' debe ser '[Nombre de mi cuenta en Heionhub]'. Solo devuélveme el bloque de código CSV.
          </pre>
        </div>
      </div>

      <ImportClient tutorialUrl={tutorialUrl} hasCompletedImportTour={hasCompletedImportTour} />
    </div>
  )
}
