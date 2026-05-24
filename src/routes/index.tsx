import { createFileRoute } from '@tanstack/react-router'
import { BiodataMaker } from '../BiodataMaker'

export const Route = createFileRoute('/')({
  component: BiodataMaker,
})
