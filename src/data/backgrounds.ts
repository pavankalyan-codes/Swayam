import type { BiodataBackground } from '../types/biodata'

const backgroundModules = import.meta.glob('../../Backgrounds/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export type BackgroundOption = {
  value: BiodataBackground
  label: string
  description: string
  image?: string
}

function fileNameFromPath(path: string) {
  return path.split('/').pop() ?? path
}

function labelFromFileName(fileName: string) {
  const name = fileName.replace(/\.[^.]+$/, '')
  return /^\d+$/.test(name) ? `Background ${name}` : name.replace(/[-_]+/g, ' ')
}

function numericAwareCompare(a: BackgroundOption, b: BackgroundOption) {
  const aNumber = Number(a.value.replace(/\.[^.]+$/, ''))
  const bNumber = Number(b.value.replace(/\.[^.]+$/, ''))

  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
    return aNumber - bNumber
  }

  return a.label.localeCompare(b.label)
}

const folderBackgroundOptions = Object.entries(backgroundModules)
  .map(([path, image]) => {
    const fileName = fileNameFromPath(path)

    return {
      value: fileName,
      label: labelFromFileName(fileName),
      description: fileName,
      image,
    }
  })
  .sort(numericAwareCompare)

export const backgroundOptions: Array<BackgroundOption> = [
  {
    value: 'none',
    label: 'No Background',
    description: 'Use the clean cream biodata page.',
  },
  ...folderBackgroundOptions,
]

export function getBackgroundImage(value: BiodataBackground) {
  return backgroundOptions.find((option) => option.value === value)?.image
}

export function getDefaultBackground() {
  return backgroundOptions.find((option) => option.value === '13.jpg')?.value ?? 'none'
}
