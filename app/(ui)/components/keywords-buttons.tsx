'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

type KeywordsButtonsProps = {
  keywords: string[]
  basePath?: string
  className?: string
  buttonClassName?: string
}

export function KeywordsButtons({
  keywords,
  basePath = '/experience/search',
  className = '',
  buttonClassName = '',
}: KeywordsButtonsProps) {
  const router = useRouter()

  const onClick = (kw: string) => {
    const query = new URLSearchParams({ keywords: kw }).toString()
    router.push(`${basePath}?${query}`)
  }

  if (!keywords || keywords.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {keywords.map((kw, idx) => (
        <button
          key={`kw-${idx}-${kw}`}
          type="button"
          onClick={() => onClick(kw)}
          className={
            buttonClassName ||
            'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition'
          }
          aria-label={`Search by ${kw}`}
        >
          {kw}
        </button>
      ))}
    </div>
  )
}
