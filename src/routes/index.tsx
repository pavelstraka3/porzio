import { createFileRoute } from '@tanstack/react-router'
import PortionCalculator from '@/components/portion-calculator.tsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <PortionCalculator />
}
