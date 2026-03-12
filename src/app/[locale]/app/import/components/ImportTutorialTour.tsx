'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TourProvider, useTour } from '@/components/ui/tour'
import { tourSteps } from '@/lib/tour-constants'
import { FileDown, RefreshCw } from 'lucide-react'
import { markImportTourCompleted } from '@/app/actions/tour'

function ImportTourLogic({ hasCompleted }: { hasCompleted: boolean }) {
  const tour = useTour()
  const [hasVisited, setHasVisited] = useState(hasCompleted)

  useEffect(() => {
    if (!hasVisited && !hasCompleted) {
      setTimeout(() => {
        tour.start('import-tutorial')
        setHasVisited(true)
      }, 500)
    }
  }, [hasVisited, hasCompleted, tour])

  if (!hasVisited) return null

  return (
    <div className="flex justify-end mt-2 absolute top-2 right-6">
      <button
        type="button"
        onClick={() => tour.start('import-tutorial')}
        className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors hover:underline"
      >
        <RefreshCw className="w-3 h-3" /> Replay Tutorial
      </button>
    </div>
  )
}

export function ImportTutorialTour({
  tutorialUrl,
  hasCompleted,
}: {
  tutorialUrl: string
  hasCompleted: boolean
}) {
  const t = useTranslations('Miru')
  // Define the tour steps specific to the import process
  const steps = [
    {
      id: tourSteps.importTutorial,
      title: 'Welcome to Bulk Import',
      content: (
        <div className="space-y-3">
          <p>{t('import.tutorialText')}</p>
          <p className="font-semibold mt-2">Before you begin:</p>
          <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
            <li>
              We only accept strict <code>.csv</code> files.
            </li>
            <li>
              If your data is in Excel or Google Sheets,{' '}
              <a
                href={tutorialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline font-medium"
              >
                click here for instructions
              </a>{' '}
              on how to 'Save as CSV'.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: tourSteps.importDropzone,
      title: 'Auto-Creation Magic',
      content: (
        <p>
          Don't worry about Account names or Categories! If you type a Category Name (like "Coffee")
          or an Account Name (like "Chase Bank") that doesn't exist yet in your dashboard,{' '}
          <strong>we will automatically create it for you!</strong>
        </p>
      ),
    },
    {
      id: 'tour-download-btn',
      title: 'Get the Template',
      content: (
        <p className="flex items-center gap-2">
          Click the <FileDown className="w-4 h-4" /> <strong>Download .csv Template</strong> button
          to see the exact 6 columns you need to provide.
        </p>
      ),
    },
  ]

  return (
    <TourProvider
      tours={[{ id: 'import-tutorial', steps }]}
      onComplete={async (id) => {
        if (id === 'import-tutorial' && !hasCompleted) {
          await markImportTourCompleted()
        }
      }}
    >
      <ImportTourLogic hasCompleted={hasCompleted} />
    </TourProvider>
  )
}
