export type ReportReason =
  | 'not_as_described'
  | 'damaged'
  | 'counterfeit'
  | 'fraud'
  | 'wrong_item'
  | 'other'

export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'resolved' | 'closed'

export type EvidenceFile = {
  id: string
  name: string
  size: number
  type: string
  preview?: string
}

export interface ReportForm {
  orderId: string
  reason: ReportReason | ''
  description: string
  evidence: EvidenceFile[]
  agreeToTerms: boolean
}

export interface ReportReasonOption {
  value: ReportReason
  label: string
  icon: string
  description: string
}

export interface RecentReport {
  id: string
  orderId: string
  reason: ReportReason
  status: ReportStatus
  date: string
  seller: string
  item: string
}