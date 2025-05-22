// Bland AI API Types - Complete Universal Coverage
export interface BlandCall {
  call_id: string;
  phone_number: string;
  status: 'queued' | 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration?: number;
  pathway_id?: string;
  from?: string;
  transcript?: string;
  summary?: string;
  analysis?: any;
  recording_url?: string;
  answered_by?: 'human' | 'voicemail' | 'unknown' | 'no-answer';
  disposition_tag?: string;
  metadata?: any;
}

export interface BlandPathway {
  pathway_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  nodes?: PathwayNode[];
  edges?: PathwayEdge[];
}

export interface PathwayNode {
  id: string;
  type: 'Default' | 'Webhook' | 'Knowledge Base' | 'End Call' | 'Transfer Call' | 'Wait for Response';
  data?: {
    name?: string;
    text?: string;
    prompt?: string;
    condition?: string;
    isStart?: boolean;
    isGlobal?: boolean;
    globalLabel?: string;
    transferNumber?: string;
    kb?: string;
    extractVars?: Array<[string, string, string]>;
    webhookUrl?: string;
    webhookMethod?: string;
    webhookData?: any;
    [key: string]: any;
  };
}

export interface PathwayEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

// Knowledge Base Types
export interface BlandKnowledgeBase {
  vector_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  documents_count?: number;
}

// Voice Types  
export interface BlandVoice {
  voice_id: string;
  name: string;
  voice_type: 'preset' | 'cloned' | 'custom';
  language?: string;
  gender?: string;
  age?: string;
  created_at?: string;
  is_public?: boolean;
}

// Custom Tool Types
export interface BlandTool {
  tool_id: string;
  name: string;
  description: string;
  speech?: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  query?: any;
  input_schema?: any;
  response?: any;
  timeout?: number;
}

// Web Agent Types
export interface BlandWebAgent {
  agent_id: string;
  prompt: string;
  voice: string;
  webhook?: string;
  analysis_schema?: any;
  metadata?: any;
  pathway_id?: string;
  language?: string;
  model?: string;
  first_sentence?: string;
  tools?: any[];
  dynamic_data?: any;
  interruption_threshold?: number;
  keywords?: string[];
  max_duration?: number;
}

// Batch Types
export interface BlandBatch {
  batch_id: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  calls?: BlandCall[];
}

// SMS Types
export interface BlandSMS {
  message_id: string;
  phone_number: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed' | 'received';
  created_at: string;
  conversation_id?: string;
}

export interface BlandSMSConversation {
  conversation_id: string;
  phone_number: string;
  messages: BlandSMS[];
  created_at: string;
  updated_at: string;
}

// Phone Number Types
export interface BlandPhoneNumber {
  number_id: string;
  phone_number: string;
  country_code: string;
  area_code: string;
  type: 'local' | 'toll_free' | 'mobile';
  status: 'active' | 'inactive';
  purchased_at: string;
  monthly_cost?: number;
}

// Organization Types
export interface BlandOrganization {
  org_id: string;
  name: string;
  members: any[];
  billing_info?: any;
  service_version?: string;
  created_at: string;
}

// Prompt Types
export interface BlandPrompt {
  prompt_id: string;
  name: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Analysis Types
export interface BlandAnalysis {
  analysis_id: string;
  call_id: string;
  sentiment: string;
  emotions?: any[];
  summary: string;
  keywords: string[];
  custom_fields?: any;
}

// Complete Call Options - Universal Coverage
export interface CallOptions {
  // Core Required
  phone_number: string;
  
  // Pathway or Task (mutually exclusive)
  pathway_id?: string;
  task?: string;
  
  // Voice & Audio
  voice?: string;
  background_track?: string;
  first_sentence?: string;
  wait_for_greeting?: boolean;
  
  // Conversation Controls
  block_interruptions?: boolean;
  interruption_threshold?: number;
  model?: 'base' | 'turbo';
  temperature?: number;
  
  // Data Integration
  dynamic_data?: any[];
  request_data?: any;
  
  // Transcription Enhancement
  keywords?: string[];
  pronunciation_guide?: any[];
  
  // Transfer & Routing
  transfer_phone_number?: string;
  transfer_list?: Record<string, string>;
  
  // Localization
  language?: string;
  timezone?: string;
  
  // Pathway Versioning
  pathway_version?: number;
  
  // Phone Number Management
  from?: string;
  local_dialing?: boolean;
  
  // Voicemail & SMS
  voicemail_sms?: any;
  voicemail_message?: string;
  voicemail_action?: 'hangup' | 'leave_message' | 'ignore';
  sensitive_voicemail_detection?: boolean;
  
  // Scheduling & Timing
  dispatch_hours?: any;
  start_time?: string;
  retry?: any;
  max_duration?: number;
  
  // Audio Processing
  noise_cancellation?: boolean;
  ignore_button_press?: boolean;
  
  // Tools & External APIs
  tools?: any[];
  
  // Recording & Analysis
  record?: boolean;
  webhook?: string;
  webhook_events?: string[];
  analysis_preset?: string;
  answered_by_enabled?: boolean;
  available_tags?: string[];
  
  // Metadata & Tracking
  metadata?: any;
  
  // Enterprise Features
  geospatial_dialing?: string;
  precall_dtmf_sequence?: string;
}

export interface BatchCallOptions {
  phone_numbers: string[];
  pathway_id?: string;
  task?: string;
  voice?: string;
  concurrency?: number;
} 