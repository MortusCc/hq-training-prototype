import type { ReactNode } from 'react'

export function Tag({ tone, children }: { tone: 'gray' | 'blue' | 'green' | 'orange' | 'red'; children: ReactNode }) {
  const map: Record<typeof tone, string> = {
    gray: 'tagGray',
    blue: 'tagBlue',
    green: 'tagGreen',
    orange: 'tagOrange',
    red: 'tagRed',
  }
  return <span className={`tag ${map[tone]}`}>{children}</span>
}
