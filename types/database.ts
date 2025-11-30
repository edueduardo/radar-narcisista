// Types TypeScript para o banco de dados do Radar Narcisista

// Enums
export type ClarityZone = 'ATENCAO' | 'ALERTA' | 'VERMELHA'
export type JournalContext = 'RELACIONAMENTO' | 'FAMILIA' | 'TRABALHO' | 'OUTRO'
export type ChatSessionKind = 'USER_COACH' | 'AI_STUDIO_LEVEL1' | 'AI_STUDIO_LEVEL2' | 'AI_STUDIO_ALL'
export type AiMessageRole = 'user' | 'assistant' | 'system' | 'meta'
export type AiSuggestionCategory = 'PRODUCT' | 'UX' | 'RISK' | 'CONTENT'
export type AiSuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED'
export type DocumentType = 'CLARITY_TEST' | 'JOURNAL' | 'COMPLETE_REPORT' | 'PROFESSIONAL_SUMMARY'

// Tables
export interface UserProfile {
  user_id: string
  name?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  user_id: string
  save_history: boolean
  save_voice_audio: boolean
  allow_ai_learning_product: boolean
  allow_ai_dataset_research: boolean
  created_at: string
  updated_at: string
}

export interface ClarityTest {
  id: string
  user_id: string
  created_at: string
  fog_score?: number
  fear_score?: number
  limits_score?: number
  global_zone?: ClarityZone
  raw_answers?: Record<string, number>
  summary?: string
  from_voice: boolean
}

// Tipos de entrada do diário (ETAPA 2 - TRIÂNGULO, ETAPA 7 - PLANO DE SEGURANÇA)
export type JournalEntryType = 'normal' | 'clarity_baseline' | 'chat_summary' | 'voice_note' | 'photo_note' | 'video_note' | 'safety_plan'

export interface JournalEntry {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  deleted_at?: string
  title?: string
  context?: string
  description?: string
  impact_score?: number
  mood_intensity?: number
  highlight?: string
  tags?: string[]
  from_voice: boolean
  // ETAPA 2 - TRIÂNGULO: Campos de integração Clareza ⇄ Diário
  entry_type?: JournalEntryType
  clarity_test_id?: string
}

export interface AiChatSession {
  id: string
  user_id: string
  created_at: string
  name?: string
  kind: ChatSessionKind
}

export interface AiMessage {
  id: string
  session_id: string
  user_id: string
  created_at: string
  role: AiMessageRole
  content: string
  from_voice: boolean
  meta?: Record<string, any>
}

export interface AiEvent {
  id: string
  user_id?: string
  source: string
  ref_id?: string
  event_type: string
  payload: Record<string, any>
  created_at: string
}

export interface AiSuggestion {
  id: string
  category: AiSuggestionCategory
  status: AiSuggestionStatus
  title: string
  description: string
  impact_score?: number
  effort_score?: number
  created_at: string
  updated_at: string
  decided_by_user_id?: string
}

export interface DailyMetric {
  metric_date: string
  metric_name: string
  value: number
  meta?: Record<string, any>
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: string
  price_id?: string
  amount?: number
  currency: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id?: string
  referral_code: string
  status: string
  reward_amount?: number
  rewarded_at?: string
  created_at: string
  updated_at: string
}

export interface DocumentHash {
  id: string  // ID único do documento (ex: RN-XXXXX-YYYY)
  user_id: string
  type: DocumentType
  sha256_hash: string
  filename: string
  generated_at: string
  created_at: string
  metadata?: Record<string, any>
}

// Anexos do Diário
export type AttachmentType = 'IMAGE' | 'AUDIO' | 'PDF' | 'VIDEO' | 'OTHER'

export interface JournalAttachment {
  id: string
  journal_entry_id: string
  user_id: string
  type: AttachmentType
  filename: string
  original_filename?: string
  file_size?: number
  mime_type?: string
  storage_path: string
  description?: string
  transcription?: string
  created_at: string
  deleted_at?: string
}

// Plano de Segurança
export interface SafetyPlan {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  emergency_contacts: Array<{
    name: string
    phone: string
    relationship: string
    is_primary: boolean
  }>
  important_documents: Array<{
    name: string
    location: string
    has_copy: boolean
  }>
  emergency_bag_items: Array<{
    item: string
    packed: boolean
    location?: string
  }>
  safe_place?: {
    address: string
    contact_name: string
    contact_phone: string
    notes: string
  }
  digital_security: {
    changed_passwords: boolean
    removed_tracking_apps: boolean
    uses_private_browsing: boolean
    has_secure_email?: boolean
  }
  overall_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'READY'
  last_reviewed_at?: string
  notes?: string
}

// Alertas de Risco (IA SHIELD)
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RiskCategory = 'PHYSICAL_VIOLENCE' | 'THREATS' | 'ISOLATION' | 'FINANCIAL_CONTROL' | 'EMOTIONAL_ABUSE' | 'STALKING' | 'OTHER'

export interface RiskAlert {
  id: string
  user_id: string
  source: 'journal' | 'chat' | 'test' | 'system'
  source_id?: string
  level: RiskLevel
  category: RiskCategory
  title: string
  description: string
  recommendation?: string
  is_read: boolean
  is_dismissed: boolean
  dismissed_at?: string
  created_at: string
}

// Configurações de Notificação
export type DiscretionLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM'

export interface NotificationSettings {
  user_id: string
  enabled: boolean
  discretion_level: DiscretionLevel
  allowed_hours_start: number
  allowed_hours_end: number
  allowed_days: string[]
  notify_diary_reminder: boolean
  notify_risk_alerts: boolean
  notify_weekly_summary: boolean
  neutral_title: string
  silent_mode: boolean
  created_at: string
  updated_at: string
}

// Configuração do Teste de Clareza
export interface ClarityTestConfig {
  id: string
  version: number
  title: string
  description: string
  scale: {
    id: string
    label: string
    options: Array<{
      value: number
      label: string
    }>
  }
  axes: Array<{
    id: string
    label: string
    minScore: number
    maxScore: number
  }>
  questions: Array<{
    id: string
    axisId: string
    text: string
    reverse: boolean
  }>
  scoring: {
    axisLevels: Array<{
      axisId: string
      levels: Array<{
        id: string
        min: number
        max: number
        title: string
        body: string
      }>
    }>
    globalLevels: Array<{
      id: string
      min: number
      max: number
      title: string
      body: string
    }>
  }
}

// Respostas do Teste de Clareza
export interface ClarityTestResponse {
  questionId: string
  value: number
}

export interface ClarityTestResult {
  scores: {
    nevoa: number
    medo: number
    limites: number
  }
  zones: {
    nevoa: 'baixo' | 'moderado' | 'alto'
    medo: 'baixo' | 'moderado' | 'alto'
    limites: 'baixo' | 'moderado' | 'alto'
  }
  globalZone: ClarityZone
  totalScore: number
}

// Para componentes React
export interface DatabaseTable {
  user_profiles: UserProfile
  user_settings: UserSettings
  clarity_tests: ClarityTest
  journal_entries: JournalEntry
  ai_chat_sessions: AiChatSession
  ai_messages: AiMessage
  ai_events: AiEvent
  ai_suggestions: AiSuggestion
  daily_metrics: DailyMetric
  subscriptions: Subscription
  referrals: Referral
  document_hashes: DocumentHash
}

// Tipos úteis para Supabase
export type Tables = DatabaseTable[keyof DatabaseTable]
export type TableName = keyof DatabaseTable

// Tipo Database para uso com createClientComponentClient
export type Database = {
  public: {
    Tables: {
      [K in keyof DatabaseTable]: {
        Row: DatabaseTable[K]
        Insert: Partial<DatabaseTable[K]>
        Update: Partial<DatabaseTable[K]>
      }
    }
  }
}
