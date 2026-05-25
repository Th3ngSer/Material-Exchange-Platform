import { ref, computed } from 'vue'
import type {
  ReportForm,
  ReportReasonOption,
  RecentReport,
  EvidenceFile,
  ReportReason,
} from '../types/report'

export function useReport() {
  const step = ref<1 | 2 | 3>(1)
  const submitting = ref(false)
  const submitted = ref(false)

  const form = ref<ReportForm>({
    orderId: '',
    reason: '',
    description: '',
    evidence: [],
    agreeToTerms: false,
  })

  const reasonOptions: ReportReasonOption[] = [
    {
      value: 'not_as_described',
      label: 'Not as Described',
      icon: '',
      description: 'Item significantly differs from the listing',
    },
    {
      value: 'damaged',
      label: 'Damaged / Defective',
      icon: '',
      description: 'Item arrived broken or in poor condition',
    },
    {
      value: 'counterfeit',
      label: 'Counterfeit / Fake',
      icon: '',
      description: 'Item appears to be inauthentic or counterfeit',
    },
    {
      value: 'fraud',
      label: 'Fraud / Scam',
      icon: '',
      description: 'Seller acted fraudulently or never sent item',
    },
    {
      value: 'wrong_item',
      label: 'Wrong Item',
      icon: '',
      description: 'Received a completely different item',
    },
    {
      value: 'other',
      label: 'Other Issue',
      icon: '',
      description: 'Something else went wrong with this order',
    },
  ]

  const recentReports = ref<RecentReport[]>([
    {
      id: 'RPT-2041',
      orderId: 'ORD-8821',
      reason: 'damaged',
      status: 'under_review',
      date: 'Apr 28, 2026',
      seller: 'SteelCo Supplies',
      item: 'Structural Steel Beam (H-Section)',
    },
    {
      id: 'RPT-1998',
      orderId: 'ORD-7743',
      reason: 'not_as_described',
      status: 'resolved',
      date: 'Apr 10, 2026',
      seller: 'MetalWorks Pro',
      item: 'Polished Aluminum Sheet 2mm',
    },
    {
      id: 'RPT-1876',
      orderId: 'ORD-6612',
      reason: 'wrong_item',
      status: 'closed',
      date: 'Mar 22, 2026',
      seller: 'BuildRight Materials',
      item: 'Copper Pipe Bundle x20',
    },
  ])

  const statusColor: Record<string, string> = {
    draft:        '#8b90a7',
    submitted:    '#3b82f6',
    under_review: '#f97316',
    resolved:     '#22c55e',
    closed:       '#8b90a7',
  }

  const statusLabel: Record<string, string> = {
    draft:        'Draft',
    submitted:    'Submitted',
    under_review: 'Under Review',
    resolved:     'Resolved',
    closed:       'Closed',
  }

  const isStep1Valid = computed(() =>
    form.value.orderId.trim().length > 0 && form.value.reason !== ''
  )

  const isStep2Valid = computed(() =>
    form.value.description.trim().length >= 30
  )

  const isStep3Valid = computed(() => form.value.agreeToTerms)

  function selectReason(value: ReportReason): void {
    form.value.reason = value
  }

  function addFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      const ef: EvidenceFile = {
        id: Math.random().toString(36).slice(2),
        name: file.name,
        size: file.size,
        type: file.type,
      }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = e => { ef.preview = e.target?.result as string }
        reader.readAsDataURL(file)
      }
      form.value.evidence.push(ef)
    })
  }

  function removeFile(id: string): void {
    form.value.evidence = form.value.evidence.filter(f => f.id !== id)
  }

  function nextStep(): void {
    if (step.value < 3) step.value = (step.value + 1) as 1 | 2 | 3
  }

  function prevStep(): void {
    if (step.value > 1) step.value = (step.value - 1) as 1 | 2 | 3
  }

  async function submitReport(): Promise<void> {
    submitting.value = true
    await new Promise(r => setTimeout(r, 1800))
    submitting.value = false
    submitted.value = true
  }

  function resetForm(): void {
    form.value = { orderId: '', reason: '', description: '', evidence: [], agreeToTerms: false }
    step.value = 1
    submitted.value = false
  }

  function formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return {
    step, submitting, submitted,
    form, reasonOptions, recentReports,
    statusColor, statusLabel,
    isStep1Valid, isStep2Valid, isStep3Valid,
    selectReason, addFiles, removeFile,
    nextStep, prevStep, submitReport, resetForm, formatSize,
  }
}