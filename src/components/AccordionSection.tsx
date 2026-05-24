import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

type AccordionSectionProps = {
  value: string
  title: string
  description?: string
  children: ReactNode
}

export function AccordionSection({
  value,
  title,
  description,
  children,
}: AccordionSectionProps) {
  return (
    <Accordion.Item
      value={value}
      className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
    >
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
          <span>
            <span className="block text-base font-semibold text-stone-950">
              {title}
            </span>
            {description ? (
              <span className="mt-1 block text-sm text-stone-500">
                {description}
              </span>
            ) : null}
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-stone-500 transition-transform group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="border-t border-stone-100 px-5 py-5">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  )
}
