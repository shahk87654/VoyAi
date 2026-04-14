export interface Trip {
  id: string
  title: string
  destination: string
  origin: string
  startDate: string
  endDate: string
  travelers: number
  budget?: string
  style: string[]
  status: 'DRAFT' | 'PLANNED' | 'BOOKED' | 'COMPLETED'
}
