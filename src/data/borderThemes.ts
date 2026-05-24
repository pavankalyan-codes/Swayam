import type { BorderTheme } from '../types/biodata'

export type BorderThemeOption = {
  value: BorderTheme
  label: string
  description: string
}

export const borderThemeOptions: Array<BorderThemeOption> = [
  {
    value: 'classic-gold',
    label: 'Classic Gold',
    description: 'Clean matrimonial border with gold lines.',
  },
  {
    value: 'curved-gold',
    label: 'Curved Gold',
    description: 'Rounded ornamental corner border.',
  },
  {
    value: 'christian-blessing',
    label: 'Jesus Blessing',
    description: 'Christian medallions with a graceful border.',
  },
  {
    value: 'hindu-divine',
    label: 'Hindu Divine',
    description: 'Vinayaka, Vishnu, and Shiva-Parvati medallions.',
  },
  {
    value: 'all-blessings',
    label: 'All Blessings',
    description: 'Jesus, Vinayaka, Vishnu, and Shiva-Parvati together.',
  },
]
