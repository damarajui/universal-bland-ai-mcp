import axios, { AxiosInstance } from 'axios';
import { 
  BlandCall, BlandPathway, BlandTool, BlandKnowledgeBase, BlandVoice, 
  BlandWebAgent, BlandBatch, BlandSMS, BlandSMSConversation, BlandPhoneNumber,
  BlandPrompt, BlandAnalysis, CallOptions, BatchCallOptions 
} from '../types/bland.js';

export class BlandAIClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    this.client = axios.create({
      baseURL: 'https://api.bland.ai/v1',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    // Add request logging for debugging
    this.client.interceptors.request.use(request => {
      console.error(`Request to: ${request.method?.toUpperCase()} ${request.baseURL}${request.url}`);
      return request;
    });

    // Add response logging for debugging
    this.client.interceptors.response.use(
      response => {
        console.error(`Response from ${response.config.url}: ${response.status}`);
        return response;
      },
      error => {
        console.error('API Error:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
        }
        return Promise.reject(error);
      }
    );
  }

  // Call Management
  async startCall(options: CallOptions): Promise<BlandCall> {
    try {
      const response = await this.client.post('/calls', options);
      return response.data;
    } catch (error: any) {
      console.error('Start call error:', error.message);
      if (error.response?.data) {
        console.error('API response:', error.response.data);
      }
      throw error;
    }
  }

  async startBatchCall(options: BatchCallOptions): Promise<{ batch_id: string; calls: BlandCall[] }> {
    try {
      const response = await this.client.post('/batches/create', options);
      return response.data;
    } catch (error: any) {
      console.error('Start batch call error:', error.message);
      if (error.response?.data) {
        console.error('API response:', error.response.data);
      }
      throw error;
    }
  }

  async getCall(callId: string): Promise<BlandCall> {
    try {
      const response = await this.client.get(`/calls/${callId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get call error for ID ${callId}:`, error.message);
      throw error;
    }
  }

  async stopCall(callId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/calls/${callId}/stop`);
      return response.data;
    } catch (error: any) {
      console.error(`Stop call error for ID ${callId}:`, error.message);
      throw error;
    }
  }

  async stopAllCalls(): Promise<{ success: boolean; stopped_calls: string[] }> {
    try {
      const response = await this.client.post('/calls/stop-all');
      return response.data;
    } catch (error: any) {
      console.error('Stop all calls error:', error.message);
      throw error;
    }
  }

  async listCalls(limit = 50): Promise<BlandCall[]> {
    try {
      const response = await this.client.get(`/calls?limit=${limit}`);
      return response.data.calls || [];
    } catch (error: any) {
      console.error('List calls error:', error.message);
      throw error;
    }
  }

  // Pathway Management
  async createPathway(name: string, description?: string): Promise<{ status: string; pathway_id: string }> {
    try {
      const payload = {
        name,
        description: description || `Pathway: ${name}`
      };
      
      const response = await this.client.post('/pathway/create', payload);
      
      if (response.data.data && response.data.data.pathway_id) {
        return {
          status: 'success',
          pathway_id: response.data.data.pathway_id
        };
      } else {
        throw new Error('Invalid response structure: pathway_id not found');
      }
    } catch (error: any) {
      console.error('Create pathway error:', error.message);
      throw error;
    }
  }

  async getPathway(pathwayId: string): Promise<BlandPathway> {
    try {
      const response = await this.client.get(`/pathway/${pathwayId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get pathway error for ID ${pathwayId}:`, error.message);
      throw error;
    }
  }

  async listPathways(): Promise<BlandPathway[]> {
    try {
      const response = await this.client.get('/pathway');
      
      // FIXED: Bland AI returns a direct array of pathways, not a nested object
      if (response.data && Array.isArray(response.data)) {
        // Map the response to our expected interface structure
        return response.data.map(pathway => ({
          pathway_id: pathway.id,  // FIXED: API uses 'id', we expect 'pathway_id'
          name: pathway.name,
          description: pathway.description || '',
          created_at: pathway.created_at || new Date().toISOString(),
          updated_at: pathway.updated_at || new Date().toISOString()
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('List pathways error:', error.message);
      throw error;
    }
  }

  async updatePathway(
    pathwayId: string, 
    name?: string, 
    description?: string, 
    nodes?: any[], 
    edges?: any[]
  ): Promise<{ status: string; message: string; pathway_data: any }> {
    try {
      const payload: any = {};
      
      if (name) payload.name = name;
      if (description) payload.description = description;
      if (nodes) payload.nodes = nodes;
      if (edges) payload.edges = edges;
      
      const response = await this.client.post(`/pathway/${pathwayId}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Update pathway error for ID ${pathwayId}:`, error.message);
      throw error;
    }
  }

  async deletePathway(pathwayId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete(`/pathway/${pathwayId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete pathway error for ID ${pathwayId}:`, error.message);
      throw error;
    }
  }

  // Tool Management
  async createTool(tool: Omit<BlandTool, 'tool_id'>): Promise<BlandTool> {
    try {
      const response = await this.client.post('/tools', tool);
      return response.data;
    } catch (error: any) {
      console.error('Create tool error:', error.message);
      throw error;
    }
  }

  async listTools(): Promise<BlandTool[]> {
    try {
      const response = await this.client.get('/tools');
      return response.data.tools || [];
    } catch (error: any) {
      console.error('List tools error:', error.message);
      throw error;
    }
  }

  // Analysis & Intelligence  
  async getCallTranscript(callId: string): Promise<any> {
    try {
      // First try to get the regular call details which includes basic transcript
      const callResponse = await this.client.get(`/calls/${callId}`);
      const callData = callResponse.data;
      
      // Try to get corrected transcript if available (requires recording to be enabled)
      let correctedTranscript = null;
      try {
        const correctedResponse = await this.client.get(`/calls/${callId}/correct`);
        correctedTranscript = correctedResponse.data;
      } catch (correctedError: any) {
        // Corrected transcript not available, continue with regular transcript
        console.error(`Corrected transcript not available for call ID ${callId}:`, correctedError.message);
      }
      
      return {
        call_id: callId,
        transcript: callData.concatenated_transcript || callData.transcripts || null,
        corrected_transcript: correctedTranscript,
        call_details: {
          duration: callData.call_length,
          status: callData.status,
          created_at: callData.created_at
        }
      };
    } catch (error: any) {
      console.error(`Get transcript error for call ID ${callId}:`, error.message);
      throw error;
    }
  }

  async analyzeCall(callId: string, goal?: string, questions?: string[][]): Promise<{ summary: string; sentiment: string; keywords: string[] }> {
    try {
      const payload: any = {};
      
      if (goal) {
        payload.goal = goal;
      }
      
      if (questions && questions.length > 0) {
        payload.questions = questions;
      } else {
        payload.questions = [
          ["Who answered the call?", "human or voicemail"],
          ["What was the overall sentiment?", "positive, negative, or neutral"],
          ["What were the main topics discussed?", "string"],
          ["Was the call objective achieved?", "boolean"]
        ];
      }
      
      const response = await this.client.post(`/calls/${callId}/analyze`, payload);
      return {
        summary: response.data.answers ? response.data.answers.join('; ') : 'Analysis completed',
        sentiment: response.data.answers && response.data.answers[1] ? response.data.answers[1] : 'neutral',
        keywords: response.data.answers && response.data.answers[2] ? [response.data.answers[2]] : []
      };
    } catch (error: any) {
      console.error(`Analyze call error for ID ${callId}:`, error.message);
      throw error;
    }
  }

  async analyzeCallEmotions(callId: string): Promise<BlandAnalysis> {
    try {
      const response = await this.client.post('/intelligence/emotions', {
        callId: callId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Analyze emotions error for call ID ${callId}:`, error.message);
      throw error;
    }
  }

  async getCallRecording(callId: string): Promise<{ recording_url: string }> {
    try {
      const response = await this.client.get(`/calls/${callId}/recording`);
      return response.data;
    } catch (error: any) {
      console.error(`Get recording error for call ID ${callId}:`, error.message);
      throw error;
    }
  }

  // Knowledge Base Management
  async createKnowledgeBase(name: string, description?: string, text?: string): Promise<{ vector_id: string }> {
    try {
      const payload: any = { name };
      if (description) payload.description = description;
      if (text) payload.text = text;
      const response = await this.client.post('/knowledgebases', payload);
      return response.data;
    } catch (error: any) {
      console.error('Create knowledge base error:', error.message);
      throw error;
    }
  }

  async uploadKnowledgeBaseText(kbId: string, text: string, metadata?: any): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/knowledgebases/${kbId}/upload-text`, { text, metadata });
      return response.data;
    } catch (error: any) {
      console.error(`Upload text error for KB ${kbId}:`, error.message);
      throw error;
    }
  }

  async uploadKnowledgeBaseMedia(kbId: string, mediaUrl: string, metadata?: any): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/knowledgebases/${kbId}/upload-media`, { media_url: mediaUrl, metadata });
      return response.data;
    } catch (error: any) {
      console.error(`Upload media error for KB ${kbId}:`, error.message);
      throw error;
    }
  }

  async listKnowledgeBases(): Promise<BlandKnowledgeBase[]> {
    try {
      const response = await this.client.get('/knowledgebases');
      // FIXED: API returns { data: { vectors: [...] } } structure
      return response.data.data?.vectors || [];
    } catch (error: any) {
      console.error('List knowledge bases error:', error.message);
      throw error;
    }
  }

  async getKnowledgeBase(kbId: string): Promise<BlandKnowledgeBase> {
    try {
      const response = await this.client.get(`/knowledgebases/${kbId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get knowledge base error for ID ${kbId}:`, error.message);
      throw error;
    }
  }

  async updateKnowledgeBase(kbId: string, updates: Partial<BlandKnowledgeBase>): Promise<{ success: boolean }> {
    try {
      const response = await this.client.patch(`/knowledgebases/${kbId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Update knowledge base error for ID ${kbId}:`, error.message);
      throw error;
    }
  }

  async deleteKnowledgeBase(kbId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete(`/knowledgebases/${kbId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete knowledge base error for ID ${kbId}:`, error.message);
      throw error;
    }
  }

  // Voice Management
  async cloneVoice(name: string, audioUrl: string, description?: string): Promise<{ voice_id: string; status: string }> {
    try {
      const response = await this.client.post('/voices', { name, audio_url: audioUrl, description });
      return response.data;
    } catch (error: any) {
      console.error('Clone voice error:', error.message);
      throw error;
    }
  }

  async listVoices(): Promise<BlandVoice[]> {
    try {
      const response = await this.client.get('/voices');
      return response.data.voices || [];
    } catch (error: any) {
      console.error('List voices error:', error.message);
      throw error;
    }
  }

  async getVoice(voiceId: string): Promise<BlandVoice> {
    try {
      const response = await this.client.get(`/voices/${voiceId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get voice error for ID ${voiceId}:`, error.message);
      throw error;
    }
  }

  async renameVoice(voiceId: string, name: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.patch(`/voices/${voiceId}`, { name });
      return response.data;
    } catch (error: any) {
      console.error(`Rename voice error for ID ${voiceId}:`, error.message);
      throw error;
    }
  }

  async deleteVoice(voiceId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete(`/voices/${voiceId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete voice error for ID ${voiceId}:`, error.message);
      throw error;
    }
  }

  async publishVoice(voiceId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/voices/${voiceId}/publish`);
      return response.data;
    } catch (error: any) {
      console.error(`Publish voice error for ID ${voiceId}:`, error.message);
      throw error;
    }
  }

  async generateAudioSample(voiceId: string, text: string): Promise<{ audio_url: string }> {
    try {
      const response = await this.client.post(`/voices/${voiceId}/generate-sample`, { text });
      return response.data;
    } catch (error: any) {
      console.error(`Generate sample error for voice ID ${voiceId}:`, error.message);
      throw error;
    }
  }

  // Advanced Tool Management
  async updateTool(toolId: string, updates: Partial<BlandTool>): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/tools/${toolId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Update tool error for ID ${toolId}:`, error.message);
      throw error;
    }
  }

  async deleteTool(toolId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete(`/tools/${toolId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete tool error for ID ${toolId}:`, error.message);
      throw error;
    }
  }

  async getTool(toolId: string): Promise<BlandTool> {
    try {
      const response = await this.client.get(`/tools/${toolId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get tool error for ID ${toolId}:`, error.message);
      throw error;
    }
  }

  // Web Agent Management
  async createWebAgent(config: Partial<BlandWebAgent>): Promise<{ agent_id: string; agent: BlandWebAgent }> {
    try {
      const response = await this.client.post('/agents', config);
      return response.data;
    } catch (error: any) {
      console.error('Create web agent error:', error.message);
      throw error;
    }
  }

  async updateWebAgent(agentId: string, updates: Partial<BlandWebAgent>): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/agents/${agentId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Update web agent error for ID ${agentId}:`, error.message);
      throw error;
    }
  }

  async authorizeWebAgentCall(agentId: string, sessionData?: any): Promise<{ session_token: string }> {
    try {
      const response = await this.client.post(`/agents/${agentId}/authorize`, sessionData);
      return response.data;
    } catch (error: any) {
      console.error(`Authorize web agent call error for ID ${agentId}:`, error.message);
      throw error;
    }
  }

  async deleteWebAgent(agentId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete(`/agents/${agentId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete web agent error for ID ${agentId}:`, error.message);
      throw error;
    }
  }

  async listWebAgents(): Promise<BlandWebAgent[]> {
    try {
      const response = await this.client.get('/agents');
      return response.data.agents || [];
    } catch (error: any) {
      console.error('List web agents error:', error.message);
      throw error;
    }
  }

  // Batch Operations
  async createBatch(phoneNumbers: string[], options: Partial<CallOptions>): Promise<{ batch_id: string }> {
    try {
      // FIXED: Use call_data structure from send-1000-calls docs
      const call_data = phoneNumbers.map(phone_number => ({ phone_number }));
      
      // FIXED: Structure exactly matching Bland docs
      const payload = {
        base_prompt: options.task || "You are making a phone call.",
        call_data,
        voice_id: options.voice_id || 0,
        max_duration: options.max_duration || 10,
        reduce_latency: options.reduce_latency !== false,
        wait_for_greeting: options.wait_for_greeting !== false,
        language: options.language || 'ENG',
        ...(options.label && { label: options.label }),
        ...(options.metadata && { metadata: options.metadata })
      };
      
      // FIXED: Use v1/batches endpoint as shown in docs
      const response = await this.client.post('/batches', payload);
      return { batch_id: response.data.batch_id };
    } catch (error: any) {
      console.error('Create batch error:', error.message);
      throw error;
    }
  }

  async getBatch(batchId: string): Promise<BlandBatch> {
    try {
      // Use the full URL for v2 API since our base client is v1
      const response = await axios.get(`https://api.bland.ai/v2/batches/${batchId}`, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error: any) {
      console.error(`Get batch error for ID ${batchId}:`, error.message);
      throw error;
    }
  }

  async listBatches(): Promise<BlandBatch[]> {
    try {
      const response = await this.client.get('/batches');
      return response.data.batches || [];
    } catch (error: any) {
      console.error('List batches error:', error.message);
      throw error;
    }
  }

  async getBatchLogs(batchId: string): Promise<{ logs: any[] }> {
    try {
      const response = await this.client.get(`/batches/${batchId}/logs`);
      return response.data;
    } catch (error: any) {
      console.error(`Get batch logs error for ID ${batchId}:`, error.message);
      throw error;
    }
  }

  async stopBatch(batchId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/batches/${batchId}/stop`);
      return response.data;
    } catch (error: any) {
      console.error(`Stop batch error for ID ${batchId}:`, error.message);
      throw error;
    }
  }

  // SMS Management
  async listSMSNumbers(): Promise<BlandPhoneNumber[]> {
    try {
      const response = await this.client.get('/sms-numbers');
      return response.data || [];
    } catch (error: any) {
      console.error('List SMS numbers error:', error.message);
      throw error;
    }
  }

  async updateSMSConfiguration(phoneNumber: string, config: any): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post('/sms/configure', { phone_number: phoneNumber, ...config });
      return response.data;
    } catch (error: any) {
      console.error('Update SMS configuration error:', error.message);
      throw error;
    }
  }

  async sendSMS(userNumber: string, agentMessage: string, agentNumber?: string, requestData?: any): Promise<{ conversation_id: string; workflow_id: string }> {
    try {
      const payload: any = { 
        user_number: userNumber, 
        agent_message: agentMessage 
      };
      if (agentNumber) payload.agent_number = agentNumber;
      if (requestData) payload.request_data = requestData;
      
      const response = await this.client.post('/sms/send', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Send SMS error:', error.message);
      throw error;
    }
  }

  async listSMSConversations(): Promise<BlandSMSConversation[]> {
    try {
      const response = await this.client.get('/sms/conversations');
      return response.data.conversations || [];
    } catch (error: any) {
      console.error('List SMS conversations error:', error.message);
      throw error;
    }
  }

  async getSMSConversation(conversationId: string): Promise<BlandSMSConversation> {
    try {
      const response = await this.client.get(`/sms/conversations/${conversationId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get SMS conversation error for ID ${conversationId}:`, error.message);
      throw error;
    }
  }

  async deleteSMSMessages(conversationId: string, messageIds?: string[]): Promise<{ success: boolean }> {
    try {
      const payload = messageIds ? { message_ids: messageIds } : {};
      const response = await this.client.delete(`/sms/conversations/${conversationId}/messages`, { data: payload });
      return response.data;
    } catch (error: any) {
      console.error(`Delete SMS messages error for conversation ${conversationId}:`, error.message);
      throw error;
    }
  }

  async deleteSMSConversation(conversationId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete(`/sms/conversations/${conversationId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete SMS conversation error for ID ${conversationId}:`, error.message);
      throw error;
    }
  }

  // Phone Number Management
  async purchasePhoneNumber(areaCode?: string, phoneNumber?: string): Promise<{ number_id: string; phone_number: string }> {
    try {
      const payload = { ...(areaCode && { area_code: areaCode }), ...(phoneNumber && { phone_number: phoneNumber }) };
      const response = await this.client.post('/numbers/purchase', payload);
      return response.data;
    } catch (error: any) {
      console.error('Purchase phone number error:', error.message);
      throw error;
    }
  }

  async updateInboundNumber(phoneNumber: string, config: any): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post('/numbers/update-inbound', { phone_number: phoneNumber, ...config });
      return response.data;
    } catch (error: any) {
      console.error('Update inbound number error:', error.message);
      throw error;
    }
  }

  async listNumbers(): Promise<BlandPhoneNumber[]> {
    try {
      const response = await this.client.get('/numbers');
      return response.data.numbers || [];
    } catch (error: any) {
      console.error('List numbers error:', error.message);
      throw error;
    }
  }

  async getNumber(numberId: string): Promise<BlandPhoneNumber> {
    try {
      const response = await this.client.get(`/numbers/${numberId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get number error for ID ${numberId}:`, error.message);
      throw error;
    }
  }

  // Prompt Management
  async listPrompts(): Promise<BlandPrompt[]> {
    try {
      const response = await this.client.get('/prompts');
      return response.data.prompts || [];
    } catch (error: any) {
      console.error('List prompts error:', error.message);
      throw error;
    }
  }

  async getPrompt(promptId: string): Promise<BlandPrompt> {
    try {
      const response = await this.client.get(`/prompts/${promptId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get prompt error for ID ${promptId}:`, error.message);
      throw error;
    }
  }

  async createPrompt(name: string, content: string, description?: string): Promise<{ prompt_id: string }> {
    try {
      const response = await this.client.post('/prompts', { name, content, description });
      return response.data;
    } catch (error: any) {
      console.error('Create prompt error:', error.message);
      throw error;
    }
  }

  // Account Management
  async getAccountDetails(): Promise<{ account: any }> {
    try {
      const response = await this.client.get('/account');
      return response.data;
    } catch (error: any) {
      console.error('Get account details error:', error.message);
      throw error;
    }
  }


} 