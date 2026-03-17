import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Media } from '@/components/display/Media'
import { RichText } from '@/modules/richText'
import { Button } from '@/components/buttons'
import { getLinkProps } from '@/lib/utils/getLinkProps'
import type { HeroBlockType } from '@/payload/payload-types'

type HeroBlockProps = Omit<HeroBlockType, 'blockType' | 'blockName'>

/**
 * Hero block component.
 * Supports four layouts: contentLeft, contentRight, contentCenter, overlay.
 */
export function HeroBlock({ heading, subheading, body, links, media, design }: HeroBlockProps) {
  if (!heading) return null

  const layout = design?.layout || 'contentLeft'
  const hasMedia = !!media

  const content = (
    <div
      className={cn(
        'flex flex-col gap-6',
        layout === 'contentCenter' && 'items-center text-center',
        layout === 'overlay' && 'items-center text-center text-white dark:text-foreground',
      )}
    >
      {subheading && (
        <p
          className={cn(
            'text-sm font-semibold uppercase tracking-widest text-primary/80 dark:text-white',
            (layout === 'overlay' || layout === 'fullOverlay') && 'text-white/90',
          )}
        >
          {subheading}
        </p>
      )}
      <h1
        className={cn(
          'text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl leading-[1.1] drop-shadow-sm text-foreground',
          (layout === 'overlay' || layout === 'fullOverlay') && 'text-white',
        )}
      >
        {heading}
      </h1>
      {body && (
        <div
          className={cn(
            'max-w-2xl text-lg text-muted-foreground dark:text-gray-300',
            (layout === 'overlay' || layout === 'fullOverlay') && 'text-white/80',
          )}
        >
          <RichText data={body} enableProse enableGutter={false} />
        </div>
      )}
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-4">
          {links.map((item, index) => {
            const linkData = item.link
            const props = getLinkProps(linkData)
            if (!props.href) return null

            const isPrimary = Number(index) === 0
            const variant = isPrimary ? (linkData.appearance as any) || 'default' : 'outline'

            return (
              <Button
                key={item.id || index}
                variant={variant}
                size={(linkData.size as any) || 'lg'}
                className={cn(
                  isPrimary &&
                    'shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow',
                  'rounded-full px-8',
                )}
                asChild
              >
                <Link href={props.href} target={props.target} rel={props.rel}>
                  {linkData.label}
                </Link>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )

  const heightMaps = {
    default: 'min-h-[70vh]',
    medium: 'min-h-[85vh]',
    full: 'min-h-[100vh]',
  }
  const minHeight =
    heightMaps[(design as any)?.heroHeight as keyof typeof heightMaps] || 'min-h-[70vh]'

  // Center layout — stacked content, optional media below
  if (layout === 'contentCenter') {
    return (
      <div className="flex flex-col items-center gap-8">
        {content}
        {hasMedia && (
          <div className="w-full max-w-full">
            <Media resource={media} className="rounded-2xl shadow-2xl ring-1 ring-border/50" />
          </div>
        )}
      </div>
    )
  }

  // Overlay layouts — media as background with content overlay
  if (layout === 'overlay' || layout === 'fullOverlay') {
    const isFull = layout === 'fullOverlay'
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700',
          minHeight,
          isFull ? 'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]' : 'rounded-3xl',
        )}
      >
        {hasMedia && (
          <div className="absolute inset-0">
            <Media
              resource={media}
              fill
              className="object-cover transition-transform duration-1000 scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-transparent backdrop-blur-[2px]" />
          </div>
        )}
        <div
          className={cn(
            'relative z-10 px-6 py-24 w-full backdrop-blur-sm bg-black/10 border border-white/10 p-8 sm:p-12 shadow-2xl my-8 rounded-2xl',
            isFull ? 'max-w-7xl mx-auto' : 'max-w-6xl mx-auto',
          )}
        >
          {content}
        </div>
      </div>
    )
  }

  // Two-column layout (contentLeft / contentRight)
  const mediaFirst = layout === 'contentRight'

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className={cn(mediaFirst && 'lg:order-2')}>{content}</div>
      {hasMedia && (
        <div className={cn(mediaFirst && 'lg:order-1')}>
          <Media
            resource={media}
            className="rounded-3xl shadow-2xl ring-1 ring-border/50 rotate-[-1deg] hover:rotate-0 transition-all duration-500"
          />
        </div>
      )}
    </div>
  )
}
