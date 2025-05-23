import { z } from 'zod';
import { BlandAIClient } from '../utils/bland-client.js';

// MODULAR BUILDING BLOCKS - Match exact Bland AI docs with ALL features
interface PathwayNodeData {
  name: string;
  type?: 'Default' | 'Webhook' | 'Knowledge Base' | 'End Call' | 'Transfer Node' | 'Wait for Response';
  isStart?: boolean;
  isGlobal?: boolean;
  globalLabel?: string;
  text?: string;           // For static text responses
  prompt?: string;         // For dynamic AI responses  
  condition?: string;      // Condition that must be met to proceed
  transferNumber?: string; // For Transfer Node type
  kb?: string;            // For Knowledge Base type
  
  // FIXED: Fine-tuning Support grouped under fine_tuning property
  fine_tuning?: {
    pathwayExamples?: Array<{ userInput: string; pathway: string }>;
    conditionExamples?: Array<{ userInput: string; conditionMet: boolean }>;
    dialogueExamples?: Array<{ scenario: string; expectedResponse: string }>;
  };
  
  // LEGACY: Keep individual properties for backward compatibility
  pathwayExamples?: Array<{ userInput: string; pathway: string }>;
  conditionExamples?: Array<{ userInput: string; conditionMet: boolean }>;
  dialogueExamples?: Array<{ scenario: string; expectedResponse: string }>;
  
  // Model Configuration (exact from docs)
  modelOptions?: {
    modelName?: string;
    interruptionThreshold?: number;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  
  // Variable Extraction (exact format from docs)
  extractVars?: Array<[string, string, string, boolean?]>; // [varName, varType, varDescription, required]
  
  // Webhook Features (for Webhook nodes)
  webhookUrl?: string;
  webhookMethod?: string;
  webhookData?: any;
  webhookHeaders?: Array<{ key: string; value: string }>;
  webhookTimeout?: number;
  webhookRetries?: number;
  
  // ADDED: Dynamic Data Integration (Real-time API calls during conversation)
  dynamic_data?: Array<{
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    query?: Record<string, any>;
    body?: any;
    cache?: boolean;
    timeout?: number;
    retries?: number;
    response_data?: Array<{
      name: string;
      data: string; // JSONPath like "$.customer.tier"
      context?: string; // How to use the variable
    }>;
    error_handling?: {
      on_error: 'continue' | 'retry' | 'fail';
      fallback_response?: string;
    };
  }>;
  
  // ADDED: Custom Tools Integration (Execute tools during conversation)
  custom_tools?: Array<{
    name: string;
    description: string;
    input_schema: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
    speech?: string; // What AI says while executing
    response_data?: Array<{
      name: string;
      data: string;
    }>;
    timeout?: number;
    error_handling?: {
      on_error: 'continue' | 'retry' | 'fail';
      fallback_response?: string;
    };
  }>;
  
  // ADDED: Advanced Voice Settings (Dynamic voice switching)
  voice_settings?: {
    voice_id?: string | number;
    speed?: number;
    interruption_threshold?: number;
    reduce_latency?: boolean;
    dynamic_voice_switching?: boolean;
    background_sound?: string;
    pronunciation_guide?: Record<string, string>;
    boost_keywords?: string[];
  };
  
  // ADDED: Real-time Intelligence Features
  ai_features?: {
    sentiment_analysis?: boolean;
    emotion_detection?: boolean;
    language_detection?: boolean;
    cultural_adaptation?: boolean;
    real_time_coaching?: boolean;
    predictive_routing?: boolean;
    conversation_insights?: boolean;
    caller_profiling?: boolean;
  };
  
  // ADDED: Wait for Response Configuration
  wait_config?: {
    wait_time_seconds?: number;
    max_wait_time?: number;
    wait_message?: string;
    timeout_action?: 'continue' | 'repeat' | 'transfer' | 'end';
    timeout_destination?: string;
  };
  
  // ADDED: Advanced Global Node Configuration
  global_config?: {
    trigger_keywords?: string[];
    priority_level?: number;
    interrupt_any_node?: boolean;
    return_to_previous?: boolean;
    context_preservation?: boolean;
  };
  
  // ADDED: Conversation Flow Control
  flow_control?: {
    can_interrupt?: boolean;
    requires_confirmation?: boolean;
    retry_attempts?: number;
    escalation_threshold?: number;
    conversation_timeout?: number;
  };
  
  // ADDED: Analytics and Tracking
  analytics?: {
    track_completion?: boolean;
    track_duration?: boolean;
    track_variables?: boolean;
    track_sentiment?: boolean;
    custom_events?: Array<{
      event_name: string;
      trigger_condition: string;
      data: Record<string, any>;
    }>;
  };
}

interface PathwayNode {
  id: string;
  type: 'Default' | 'Webhook' | 'Knowledge Base' | 'End Call' | 'Transfer Node' | 'Wait for Response';
  data: PathwayNodeData;
}

interface PathwayEdge {
  id: string;
  source: string;
  target: string;
  label: string; // What the agent uses to decide which path to take
  data?: {
    name?: string;
    description?: string;
  };
}

// MODULAR FEATURE BUILDERS - Complete Bland AI Feature Support
class ModularNodeBuilder {
  private nodeData: Partial<PathwayNodeData> = {};
  private nodeType: PathwayNode['type'] = 'Default';
  private nodeId: string;

  constructor(id: string, name: string) {
    this.nodeId = id;
    this.nodeData.name = name;
  }

  // Node type setters
  asDefault(): this { this.nodeType = 'Default'; return this; }
  asWebhook(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'): this {
    this.nodeType = 'Webhook';
    this.nodeData.webhookUrl = url;
    this.nodeData.webhookMethod = method;
    return this;
  }
  asKnowledgeBase(kbContent: string): this {
    this.nodeType = 'Knowledge Base';
    this.nodeData.kb = kbContent;
    return this;
  }
  asTransfer(phoneNumber: string): this {
    this.nodeType = 'Transfer Node';
    this.nodeData.transferNumber = phoneNumber;
    return this;
  }
  asEndCall(): this { this.nodeType = 'End Call'; return this; }
  
  // ADDED: Wait for Response node type
  asWaitForResponse(waitConfig?: {
    wait_time_seconds?: number;
    max_wait_time?: number;
    wait_message?: string;
    timeout_action?: 'continue' | 'repeat' | 'transfer' | 'end';
    timeout_destination?: string;
  }): this { 
    this.nodeType = 'Wait for Response'; 
    this.nodeData.wait_config = waitConfig;
    return this; 
  }

  // Feature setters
  asStart(): this { this.nodeData.isStart = true; return this; }
  
  // ENHANCED: Advanced global node configuration
  asGlobal(label: string, config?: {
    trigger_keywords?: string[];
    priority_level?: number;
    interrupt_any_node?: boolean;
    return_to_previous?: boolean;
    context_preservation?: boolean;
  }): this {
    this.nodeData.isGlobal = true;
    this.nodeData.globalLabel = label;
    this.nodeData.global_config = config;
    return this;
  }
  
  withStaticText(text: string): this { this.nodeData.text = text; return this; }
  withPrompt(prompt: string): this { this.nodeData.prompt = prompt; return this; }
  withCondition(condition: string): this { this.nodeData.condition = condition; return this; }
  
  // ENHANCED: Advanced variable extraction with required/optional
  withVariableExtraction(vars: Array<[string, string, string, boolean?]>): this {
    this.nodeData.extractVars = vars;
    return this;
  }
  
  // ENHANCED: Advanced webhook configuration
  withWebhookData(data: any): this { this.nodeData.webhookData = data; return this; }
  withWebhookHeaders(headers: Array<{ key: string; value: string }>): this {
    this.nodeData.webhookHeaders = headers;
    return this;
  }
  withWebhookConfig(config: { timeout?: number; retries?: number }): this {
    this.nodeData.webhookTimeout = config.timeout;
    this.nodeData.webhookRetries = config.retries;
    return this;
  }

  // FIXED: Complete fine-tuning support using new grouped structure
  withFineTuning(
    pathwayExamples?: Array<{ userInput: string; pathway: string }>,
    conditionExamples?: Array<{ userInput: string; conditionMet: boolean }>,
    dialogueExamples?: Array<{ scenario: string; expectedResponse: string }>
  ): this {
    // FIXED: Set both the new grouped structure and legacy individual properties
    if (pathwayExamples || conditionExamples || dialogueExamples) {
      this.nodeData.fine_tuning = {
        pathwayExamples,
        conditionExamples,
        dialogueExamples
      };
      
      // Also set legacy individual properties for backward compatibility
    if (pathwayExamples) this.nodeData.pathwayExamples = pathwayExamples;
    if (conditionExamples) this.nodeData.conditionExamples = conditionExamples;
    if (dialogueExamples) this.nodeData.dialogueExamples = dialogueExamples;
    }
    return this;
  }

  // ENHANCED: Complete model configuration
  withModelOptions(options: {
    modelName?: string;
    interruptionThreshold?: number;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  }): this {
    this.nodeData.modelOptions = options;
    return this;
  }

  // ADDED: Dynamic data integration during conversations
  withDynamicData(dynamicData: Array<{
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    query?: Record<string, any>;
    body?: any;
    cache?: boolean;
    timeout?: number;
    retries?: number;
    response_data?: Array<{
      name: string;
      data: string;
      context?: string;
    }>;
    error_handling?: {
      on_error: 'continue' | 'retry' | 'fail';
      fallback_response?: string;
    };
  }>): this {
    this.nodeData.dynamic_data = dynamicData;
    return this;
  }
  
  // ADDED: Custom tools integration
  withCustomTools(tools: Array<{
    name: string;
    description: string;
    input_schema: any;
    speech?: string;
    response_data?: Array<{ name: string; data: string; }>;
    timeout?: number;
    error_handling?: {
      on_error: 'continue' | 'retry' | 'fail';
      fallback_response?: string;
    };
  }>): this {
    this.nodeData.custom_tools = tools;
    return this;
  }
  
  // ENHANCED: Complete voice settings
  withAdvancedVoice(settings: {
    voice_id?: string | number;
    speed?: number;
    interruption_threshold?: number;
    reduce_latency?: boolean;
    dynamic_voice_switching?: boolean;
    background_sound?: string;
    pronunciation_guide?: Record<string, string>;
    boost_keywords?: string[];
  }): this {
    this.nodeData.voice_settings = settings;
    return this;
  }
  
  // ADDED: Complete AI features
  withAIFeatures(features: {
    sentiment_analysis?: boolean;
    emotion_detection?: boolean;
    language_detection?: boolean;
    cultural_adaptation?: boolean;
    real_time_coaching?: boolean;
    predictive_routing?: boolean;
    conversation_insights?: boolean;
    caller_profiling?: boolean;
  }): this {
    this.nodeData.ai_features = features;
    return this;
  }
  
  // ADDED: Conversation flow control
  withFlowControl(flowControl: {
    can_interrupt?: boolean;
    requires_confirmation?: boolean;
    retry_attempts?: number;
    escalation_threshold?: number;
    conversation_timeout?: number;
  }): this {
    this.nodeData.flow_control = flowControl;
    return this;
  }
  
  // ADDED: Analytics and tracking
  withAnalytics(analytics: {
    track_completion?: boolean;
    track_duration?: boolean;
    track_variables?: boolean;
    track_sentiment?: boolean;
    custom_events?: Array<{
      event_name: string;
      trigger_condition: string;
      data: Record<string, any>;
    }>;
  }): this {
    this.nodeData.analytics = analytics;
    return this;
  }

  build(): PathwayNode {
    return {
      id: this.nodeId,
      type: this.nodeType,
      data: {
        ...this.nodeData,
        name: this.nodeData.name || '', // FIXED: Ensure name is always a string
        type: this.nodeType // Add type to data per Bland docs
      }
    };
  }
}

class ModularEdgeBuilder {
  private edgeData: Partial<PathwayEdge> = {};

  constructor(id: string, source: string, target: string, label: string) {
    this.edgeData.id = id;
    this.edgeData.source = source;
    this.edgeData.target = target;
    this.edgeData.label = label;
  }

  withMetadata(name: string, description: string): this {
    this.edgeData.data = { name, description };
    return this;
  }

  build(): PathwayEdge {
    return this.edgeData as PathwayEdge;
  }
}

// NATURAL LANGUAGE PARSER FOR PATHWAY COMPONENTS
class PathwayComponentParser {
  static parseNodeTypes(description: string): Array<{ type: string; purpose: string }> {
    const nodeTypes = [];
    
    // Detection patterns for different node types
    if (this.contains(description, ['webhook', 'api', 'integration', 'system', 'database', 'crm'])) {
      nodeTypes.push({ type: 'Webhook', purpose: 'system integration' });
    }
    if (this.contains(description, ['knowledge', 'faq', 'documentation', 'information', 'search'])) {
      nodeTypes.push({ type: 'Knowledge Base', purpose: 'information lookup' });
    }
    if (this.contains(description, ['transfer', 'human', 'agent', 'specialist', 'escalate'])) {
      nodeTypes.push({ type: 'Transfer Node', purpose: 'human handoff' });
    }
    if (this.contains(description, ['wait', 'pause', 'hold', 'think', 'process'])) {
      nodeTypes.push({ type: 'Wait for Response', purpose: 'processing time' });
    }
    if (this.contains(description, ['end', 'finish', 'complete', 'goodbye', 'close'])) {
      nodeTypes.push({ type: 'End Call', purpose: 'conversation ending' });
    }
    
    // Always include Default for conversation flow
    nodeTypes.push({ type: 'Default', purpose: 'conversation handling' });
    
    return nodeTypes;
  }

  static parseFeatures(description: string): {
    needsVariableExtraction: boolean;
    needsConditions: boolean;
    needsGlobalNodes: boolean;
    variables: Array<[string, string, string]>;
  } {
    const features = {
      needsVariableExtraction: false,
      needsConditions: false,
      needsGlobalNodes: false,
      variables: [] as Array<[string, string, string]>
    };

    // Variable extraction detection
    if (this.contains(description, ['collect', 'gather', 'ask for', 'get', 'name', 'email', 'phone', 'information'])) {
      features.needsVariableExtraction = true;
      
      // Common variables
      if (this.contains(description, ['name'])) features.variables.push(['customer_name', 'string', 'Customer name']);
      if (this.contains(description, ['email'])) features.variables.push(['email_address', 'string', 'Email address']);
      if (this.contains(description, ['phone'])) features.variables.push(['phone_number', 'string', 'Phone number']);
      if (this.contains(description, ['intent', 'reason', 'purpose'])) features.variables.push(['call_intent', 'string', 'Reason for calling']);
    }

    // Condition detection
    if (this.contains(description, ['if', 'when', 'unless', 'before', 'after', 'ensure', 'verify', 'check'])) {
      features.needsConditions = true;
    }

    // Global node detection
    if (this.contains(description, ['help', 'questions', 'anytime', 'interrupt', 'clarification'])) {
      features.needsGlobalNodes = true;
    }

    return features;
  }

  static parseWorkflowSteps(description: string): Array<{
    stepName: string;
    stepType: string;
    stepPurpose: string;
  }> {
    const steps = [];
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length < 10) continue;
      
      let stepType = 'Default';
      let stepPurpose = sentence;
      
      // Determine step type based on content
      if (this.contains(sentence, ['start', 'begin', 'greet', 'welcome'])) {
        stepType = 'greeting';
      } else if (this.contains(sentence, ['collect', 'ask', 'gather'])) {
        stepType = 'information_gathering';
      } else if (this.contains(sentence, ['decide', 'determine', 'route', 'check'])) {
        stepType = 'decision_making';
      } else if (this.contains(sentence, ['resolve', 'solve', 'handle', 'process'])) {
        stepType = 'resolution';
      } else if (this.contains(sentence, ['end', 'finish', 'close'])) {
        stepType = 'ending';
      }
      
      steps.push({
        stepName: `Step ${i + 1}: ${stepType.replace('_', ' ')}`,
        stepType,
        stepPurpose
      });
    }
    
    return steps;
  }

  private static contains(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }
}

// MODULAR PATHWAY BUILDER
class ModularPathwayBuilder {
  private nodes: PathwayNode[] = [];
  private edges: PathwayEdge[] = [];
  private nodeCount = 0;
  private edgeCount = 0;

  addNode(builder: ModularNodeBuilder): string {
    const node = builder.build();
    this.nodes.push(node);
    return node.id;
  }

  addEdge(source: string, target: string, label: string, metadata?: { name: string; description: string }): string {
    const edgeId = `edge_${++this.edgeCount}`;
    const builder = new ModularEdgeBuilder(edgeId, source, target, label);
    if (metadata) builder.withMetadata(metadata.name, metadata.description);
    
    this.edges.push(builder.build());
    return edgeId;
  }

  createNode(name: string): ModularNodeBuilder {
    return new ModularNodeBuilder(`node_${++this.nodeCount}`, name);
  }

  build(): { nodes: PathwayNode[]; edges: PathwayEdge[] } {
    return { nodes: this.nodes, edges: this.edges };
  }
}

// Complete pathway interface for compatibility
interface CompletePathway {
  name: string;
  description: string;
  nodes: PathwayNode[];
  edges: PathwayEdge[];
}

// Helper function to analyze branching complexity
function analyzeBranchingComplexity(pathwayStructure: { nodes: PathwayNode[], edges: PathwayEdge[] }) {
  const nodeEdgeCounts = new Map<string, number>();
  const conditionalPaths: string[] = [];
  const specialistTypes: string[] = [];
  const routingConditions: Array<{from: string; to: string; condition: string}> = [];
  
  // Count outgoing edges per node
  for (const edge of pathwayStructure.edges) {
    const count = nodeEdgeCounts.get(edge.source) || 0;
    nodeEdgeCounts.set(edge.source, count + 1);
    
    conditionalPaths.push(edge.label);
    routingConditions.push({
      from: edge.source,
      to: edge.target,
      condition: edge.label
    });
  }
  
  // Identify specialist nodes
  for (const node of pathwayStructure.nodes) {
    if (node.data.name?.includes('Specialist')) {
      specialistTypes.push(node.data.name);
    }
  }
  
  const maxBranches = Math.max(...Array.from(nodeEdgeCounts.values()), 0);
  const branchingPoints = Array.from(nodeEdgeCounts.values()).filter(count => count > 1).length;
  
  return {
    branchingPoints,
    maxBranches,
    conditionalPaths,
    specialistTypes,
    routingConditions
  };
}

// Helper function to parse all configuration strings
function parseAllConfigurations(args: any): Record<string, any> {
  const config: Record<string, any> = {};
  const keysToParse = [
    'webhook_integrations', 'knowledge_bases', 'transfer_numbers',
    'custom_tools_config', 'dynamic_data_config', 'voice_settings',
    'model_settings', 'analytics_config'
  ];

  for (const key of keysToParse) {
    const targetKey = key.replace(/_config$|_settings$/, '');
    if (args[key] && typeof args[key] === 'string') {
      try {
        config[targetKey] = JSON.parse(args[key]);
      } catch (e) {
        console.warn(`Failed to parse ${key}:`, e);
        // Initialize with a default type if parsing fails, attempting to guess if it should be an array
        config[targetKey] = (key.endsWith('s') || key.endsWith('es')) ? [] : {};
      }
    } else if (args[key]) {
      config[targetKey] = args[key];
    } else {
       // Initialize with a default type, attempting to guess if it should be an array
      config[targetKey] = (key.endsWith('s') || key.endsWith('es')) ? [] : {};
    }
  }
  return config;
}

// Helper function to build the pathway structure
function buildUnlimitedComplexityPathway(args: any, config: Record<string, any>): { nodes: PathwayNode[], edges: PathwayEdge[] } {
  // Utilize the most advanced builder we have and extend it
  const domainBuilder = new DomainSpecificBranchingBuilder();
  
  // Prepare args for the builder, merging parsed configs
  const builderArgs = {
    ...args,
    name: args.name, // Ensure name is passed
    description: args.description, // Ensure description is passed
    webhook_integrations: config.webhook_integrations || [],
    knowledge_bases: config.knowledge_bases || [],
    transfer_numbers: config.transfer_numbers || [],
    // Pass other configurations that DomainSpecificBranchingBuilder might use or be adapted to use
    // For instance, if node-level voice/model/analytics settings are desired,
    // the builder would need to be enhanced to accept these and apply them.
    // For now, we pass them at top level.
    custom_tools: config.custom_tools || [], 
    dynamic_data: config.dynamic_data || [],
    voice_settings: config.voice_settings || {},
    model_settings: config.model_settings || {},
    analytics_settings: config.analytics_settings || {},
  };

  return domainBuilder.buildFromDescription(args.description, builderArgs);
}

// FIXED: Helper function for analytics with corrected fine_tuning access
function analyzeUnlimitedComplexity(pathwayStructure: { nodes: PathwayNode[], edges: PathwayEdge[] }): Record<string, any> {
  const baseAnalysis = analyzeBranchingComplexity(pathwayStructure); // Reuse existing analyzer
  let complexityScore = baseAnalysis.branchingPoints * 5 + baseAnalysis.maxBranches * 3 + pathwayStructure.nodes.length + pathwayStructure.edges.length;

  // Add points for advanced features used
  pathwayStructure.nodes.forEach(node => {
    if (node.data.dynamic_data && node.data.dynamic_data.length > 0) complexityScore += 10;
    if (node.data.custom_tools && node.data.custom_tools.length > 0) complexityScore += 10;
    if (node.data.ai_features && Object.values(node.data.ai_features).some(val => val)) complexityScore += 5;
    if (node.type === 'Wait for Response') complexityScore += 3;
    if (node.data.isGlobal) complexityScore += 5;
    // FIXED: Use new fine_tuning structure
    if (node.data.fine_tuning && (node.data.fine_tuning.pathwayExamples?.length || node.data.fine_tuning.conditionExamples?.length || node.data.fine_tuning.dialogueExamples?.length)) complexityScore += 7;
    if (node.data.analytics && node.data.analytics.custom_events?.length) complexityScore += 4;
  });
  
  // FIXED: Use new fine_tuning structure
  const has_fine_tuning = pathwayStructure.nodes.some(n => n.data.fine_tuning && (n.data.fine_tuning.pathwayExamples?.length || n.data.fine_tuning.conditionExamples?.length || n.data.fine_tuning.dialogueExamples?.length));
  const has_wait_nodes = pathwayStructure.nodes.some(n => n.type === 'Wait for Response');

  return {
    ...baseAnalysis,
    complexity_score: complexityScore,
    has_dynamic_data: pathwayStructure.nodes.some(n => n.data.dynamic_data && n.data.dynamic_data.length > 0),
    has_custom_tools: pathwayStructure.nodes.some(n => n.data.custom_tools && n.data.custom_tools.length > 0),
    has_ai_features: pathwayStructure.nodes.some(n => n.data.ai_features && Object.values(n.data.ai_features).some(val => val)),
    has_fine_tuning,
    has_wait_nodes,
    has_advanced_globals: pathwayStructure.nodes.some(n => n.data.isGlobal && n.data.global_config),
  };
}

// HELPER FUNCTIONS FOR SPECIALIZED PATHWAY BUILDING

// Enterprise Sales Pathway Builder
function buildEnterpriseSalesPathway(args: any): { nodes: PathwayNode[], edges: PathwayEdge[] } {
  const builder = new ModularPathwayBuilder();
  
  // 1. QUALIFICATION HUB with GLOBAL "HELP" NODE
  const helpNodeId = builder.addNode(
    builder.createNode('Sales Help & Clarification')
      .asGlobal('help', {
        trigger_keywords: ['help', 'confused', 'what', 'explain', 'clarify'],
        priority_level: 10,
        interrupt_any_node: true,
        return_to_previous: true,
        context_preservation: true
      })
      .withPrompt('I\'m here to help clarify anything about our sales process or products. What specific information can I provide?')
      .withAIFeatures({
        sentiment_analysis: true,
        emotion_detection: true,
        conversation_insights: true
      })
  );
  
  // 2. QUALIFICATION HUB
  const qualificationHubId = builder.addNode(
    builder.createNode(`${args.company_name} Enterprise Sales`)
      .asStart()
      .withPrompt(`Welcome to ${args.company_name}! I'm your enterprise sales specialist for ${args.product_or_service}. 
                   I'll help qualify your needs and connect you with the right solutions.
                   To provide the best recommendations, let me understand your requirements.`)
      .withVariableExtraction([
        ['company_name', 'string', 'Prospect company name', true],
        ['company_size', 'integer', 'Number of employees', true],
        ['annual_revenue', 'string', 'Annual company revenue', false],
        ['current_solution', 'string', 'Current solution in use', false],
        ['decision_timeframe', 'string', 'Decision timeline', true],
        ['budget_authority', 'boolean', 'Has budget authority', true],
        ['pain_points', 'string', 'Current challenges', true]
      ])
      .withAIFeatures({
        sentiment_analysis: true,
        emotion_detection: true,
        caller_profiling: true,
        conversation_insights: true
      })
      .withAnalytics({
        track_completion: true,
        track_variables: true,
        custom_events: [
          { event_name: 'qualification_started', trigger_condition: 'node_entered', data: { company: args.company_name } }
        ]
      })
  );

  // 3. LEAD SCORING & QUALIFICATION
  const leadScoringId = builder.addNode(
    builder.createNode('Enterprise Lead Scoring')
      .withPrompt(`Based on your information, let me calculate your qualification score and determine the best next steps.
                   ${args.lead_scoring || 'Evaluating company fit, budget authority, timeline, and technical requirements.'}`)
      .withCustomTools([
        {
          name: 'lead_scorer',
          description: 'Calculate enterprise lead qualification score',
          input_schema: {
            type: 'object',
            properties: {
              company_size: { type: 'integer' },
              budget_authority: { type: 'boolean' },
              timeline: { type: 'string' },
              pain_points: { type: 'string' }
            },
            required: ['company_size', 'budget_authority']
          },
          speech: 'Let me calculate your qualification score...',
          response_data: [
            { name: 'lead_score', data: '$.score' },
            { name: 'qualification_tier', data: '$.tier' }
          ]
        }
      ])
      .withCondition('Must calculate lead score before proceeding')
  );

  // 4. OBJECTION HANDLING GLOBAL NODE
  const objectionNodeId = builder.addNode(
    builder.createNode('Objection Resolution Specialist')
      .asGlobal('objection', {
        trigger_keywords: ['expensive', 'too much', 'budget', 'competitor', 'concern', 'worried', 'problem'],
        priority_level: 9,
        interrupt_any_node: true,
        return_to_previous: true
      })
      .withPrompt(`I understand your concerns. Let me address that specifically.
                   ${args.objection_handling || 'Common concerns include pricing, implementation, and ROI. Let me provide detailed information.'}`)
      .withFineTuning(
        [
          { userInput: 'Too expensive', pathway: 'roi_demonstration' },
          { userInput: 'Implementation concerns', pathway: 'implementation_support' },
          { userInput: 'Competitor comparison', pathway: 'competitive_differentiation' }
        ],
        [
          { userInput: 'This sounds too complex', conditionMet: true },
          { userInput: 'We need to think about it', conditionMet: true }
        ],
        [
          { scenario: 'Price objection', expectedResponse: 'I understand budget is important. Let me show you the ROI calculations...' },
          { scenario: 'Competitor mention', expectedResponse: 'Great question! Here\'s how we compare specifically...' }
        ]
      )
  );

  // 5. HIGH-VALUE PROSPECT PATH
  const highValueId = builder.addNode(
    builder.createNode('High-Value Enterprise Specialist')
      .withPrompt(`Excellent! Based on your qualification, you're a perfect fit for our enterprise solution.
                   Let me connect you with our senior sales executive who specializes in ${args.product_or_service}.
                   They'll provide a custom demo and enterprise pricing.`)
      .withCondition('Lead score >= 50 points')
      .withDynamicData([
        {
          url: args.webhook_url || 'https://api.salesforce.com/high-value-leads',
          method: 'POST',
          body: {
            company: '{{company_name}}',
            score: '{{lead_score}}',
            priority: 'high'
          },
          response_data: [
            { name: 'sales_rep_assigned', data: '$.assigned_rep' },
            { name: 'demo_scheduled', data: '$.demo_time' }
          ]
        }
      ])
  );

  // 6. QUALIFIED PROSPECT PATH
  const qualifiedId = builder.addNode(
    builder.createNode('Qualified Prospect Specialist')
      .withPrompt(`Great! You qualify for our enterprise program. Let me schedule a detailed consultation
                   to show you exactly how ${args.product_or_service} can solve your specific challenges.`)
      .withCondition('Lead score >= 40 points')
      .withVariableExtraction([
        ['preferred_demo_time', 'string', 'Preferred demo scheduling', true],
        ['key_stakeholders', 'string', 'Other decision makers', false],
        ['technical_requirements', 'string', 'Technical integration needs', false]
      ])
  );

  // 7. NURTURE PROSPECT PATH  
  const nurtureId = builder.addNode(
    builder.createNode('Prospect Nurturing System')
      .withPrompt(`Thanks for your interest! While you may not be ready for our enterprise solution right now,
                   I'd love to keep you informed about our developments and check back in the future.`)
      .withCondition('Lead score < 40 points')
      .withVariableExtraction([
        ['follow_up_timeframe', 'string', 'When to follow up', true],
        ['information_interests', 'string', 'Types of information wanted', false]
      ])
  );

  // 8. ENTERPRISE TRANSFER NODE
  const transferId = builder.addNode(
    builder.createNode('Enterprise Sales Executive Transfer')
      .asTransfer(args.transfer_number || '+1-800-ENTERPRISE')
      .withPrompt(`Perfect! I'm transferring you to our enterprise sales executive who will provide
                   a personalized consultation and enterprise pricing for ${args.company_name}.`)
  );

  // 9. COMPLETION NODE
  const completionId = builder.addNode(
    builder.createNode('Sales Process Complete')
      .asEndCall()
      .withPrompt(`Thank you for considering ${args.company_name}! We're excited about the opportunity
                   to help transform your business with ${args.product_or_service}.`)
  );

  // BUILD EDGES WITH SOPHISTICATED ROUTING
  builder.addEdge(qualificationHubId, leadScoringId, 'completed qualification questions', { name: 'Qualification Complete', description: 'All required qualification data collected' });
  
  builder.addEdge(leadScoringId, highValueId, 'high-value enterprise prospect', { name: 'High-Value Route', description: 'Score >= 50, enterprise fit' });
  builder.addEdge(leadScoringId, qualifiedId, 'qualified enterprise prospect', { name: 'Qualified Route', description: 'Score >= 40, good fit' });
  builder.addEdge(leadScoringId, nurtureId, 'prospect needs nurturing', { name: 'Nurture Route', description: 'Score < 40, future potential' });
  
  builder.addEdge(highValueId, transferId, 'ready for executive consultation', { name: 'Executive Transfer', description: 'High-value prospect ready for senior sales' });
  builder.addEdge(qualifiedId, transferId, 'ready for detailed demo', { name: 'Demo Transfer', description: 'Qualified prospect ready for demo' });
  
  builder.addEdge(transferId, completionId, 'transfer completed', { name: 'Process Complete', description: 'Successfully transferred to sales team' });
  builder.addEdge(nurtureId, completionId, 'nurture process complete', { name: 'Nurture Complete', description: 'Added to nurture campaign' });

  return builder.build();
}

// Advanced Customer Service Pathway Builder  
function buildAdvancedCustomerServicePathway(args: any): { nodes: PathwayNode[], edges: PathwayEdge[] } {
  const builder = new ModularPathwayBuilder();
  
  // 1. GLOBAL ESCALATION NODE
  const escalationNodeId = builder.addNode(
    builder.createNode('Escalation Manager')
      .asGlobal('escalate', {
        trigger_keywords: ['manager', 'supervisor', 'escalate', 'complaint', 'unsatisfied', 'angry'],
        priority_level: 10,
        interrupt_any_node: true,
        return_to_previous: false
      })
      .withPrompt(`I understand you'd like to speak with a manager. Let me connect you with our escalation team
                   who can provide additional assistance and ensure your concerns are properly addressed.`)
      .asTransfer(args.escalation_number || '+1-800-ESCALATE')
  );

  // 2. CUSTOMER SERVICE HUB
  const serviceHubId = builder.addNode(
    builder.createNode(`${args.company_name} Customer Service`)
      .asStart()
      .withPrompt(`Hello! Welcome to ${args.company_name} customer service. I'm here to help with any questions
                   or issues you may have. I can assist with: ${args.service_types.join(', ')}.
                   What can I help you with today?`)
      .withVariableExtraction([
        ['customer_email', 'string', 'Customer email address', true],
        ['issue_category', 'string', 'Type of issue or question', true],
        ['urgency_level', 'string', 'How urgent is this issue', false],
        ['previous_ticket', 'string', 'Any previous support ticket numbers', false]
      ])
      .withAIFeatures({
        sentiment_analysis: true,
        emotion_detection: true,
        language_detection: true,
        conversation_insights: true
      })
  );

  // 3. ISSUE CLASSIFICATION & ROUTING
  const classificationId = builder.addNode(
    builder.createNode('Intelligent Issue Classification')
      .withPrompt('Let me analyze your issue and route you to the right specialist who can provide the best assistance.')
      .withCustomTools([
        {
          name: 'issue_classifier',
          description: 'Classify customer service issues',
          input_schema: {
            type: 'object',
            properties: {
              issue_description: { type: 'string' },
              category: { type: 'string' },
              urgency: { type: 'string' }
            },
            required: ['issue_description']
          },
          speech: 'Let me analyze your issue...',
          response_data: [
            { name: 'issue_type', data: '$.classification' },
            { name: 'recommended_specialist', data: '$.specialist' },
            { name: 'estimated_resolution_time', data: '$.eta' }
          ]
        }
      ])
  );

  // 4. CREATE SPECIALIST NODES FOR EACH SERVICE TYPE
  const specialistNodes: Record<string, string> = {};
  
  for (const serviceType of args.service_types) {
    const specialistId = builder.addNode(
      builder.createNode(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Specialist`)
        .withPrompt(`I'm your ${serviceType} specialist. I have access to all the tools and information needed
                     to resolve your ${serviceType} issues quickly and effectively.`)
        .withCondition(`Issue classified as ${serviceType}`)
        .withVariableExtraction([
          [`${serviceType}_details`, 'string', `Specific ${serviceType} issue details`, true],
          [`${serviceType}_resolution_preference`, 'string', `Preferred resolution method`, false]
        ])
        .withDynamicData([
          {
            url: args.resolution_webhook || 'https://api.support.com/tickets',
            method: 'POST',
            body: {
              customer_email: '{{customer_email}}',
              issue_type: serviceType,
              details: `{{${serviceType}_details}}`,
              priority: '{{urgency_level}}'
            },
            response_data: [
              { name: 'ticket_number', data: '$.ticket_id' },
              { name: 'resolution_steps', data: '$.recommended_steps' }
            ]
          }
        ])
        .withAnalytics({
          track_completion: true,
          track_duration: true,
          custom_events: [
            { event_name: `${serviceType}_issue_started`, trigger_condition: 'node_entered', data: { type: serviceType } }
          ]
        })
    );
    specialistNodes[serviceType] = specialistId;
  }

  // 5. KNOWLEDGE BASE INTEGRATION
  const knowledgeBaseId = builder.addNode(
    builder.createNode('Knowledge Base Search')
      .asKnowledgeBase(args.knowledge_base_content || 'Comprehensive customer service knowledge base with solutions, procedures, and troubleshooting guides.')
      .withPrompt('Let me search our knowledge base for the most relevant information to help resolve your issue.')
  );

  // 6. SATISFACTION TRACKING
  const satisfactionId = builder.addNode(
    builder.createNode('Customer Satisfaction Survey')
      .withPrompt(`Thank you for contacting ${args.company_name}! Before we finish,
                   I'd love to get your feedback on the service you received today.
                   ${args.satisfaction_tracking ? 'This helps us improve our service quality.' : ''}`)
      .withVariableExtraction([
        ['satisfaction_rating', 'integer', 'Satisfaction rating 1-10', true],
        ['service_feedback', 'string', 'Additional feedback or comments', false],
        ['follow_up_needed', 'boolean', 'Does this need follow-up', false]
      ])
      .withAnalytics({
        track_completion: true,
        track_sentiment: true,
        custom_events: [
          { event_name: 'satisfaction_survey_completed', trigger_condition: 'node_completed', data: { rating: '{{satisfaction_rating}}' } }
        ]
      })
  );

  // 7. COMPLETION NODE
  const completionId = builder.addNode(
    builder.createNode('Service Complete')
      .asEndCall()
      .withPrompt(`Thank you for choosing ${args.company_name}! We're always here to help.
                   Your ticket number is {{ticket_number}} for reference. Have a great day!`)
  );

  // BUILD SOPHISTICATED ROUTING EDGES
  builder.addEdge(serviceHubId, classificationId, 'issue information collected', { name: 'Classification Route', description: 'Route to issue analysis' });
  
  // Classification to specialists
  for (const serviceType of args.service_types) {
    builder.addEdge(classificationId, specialistNodes[serviceType], `issue classified as ${serviceType}`, 
      { name: `${serviceType} Route`, description: `Route to ${serviceType} specialist` });
  }
  
  // Knowledge base routing
  builder.addEdge(classificationId, knowledgeBaseId, 'needs knowledge base search', 
    { name: 'Knowledge Base Route', description: 'Route to knowledge base for information' });
  
  // Resolution to satisfaction
  for (const serviceType of args.service_types) {
    builder.addEdge(specialistNodes[serviceType], satisfactionId, `${serviceType} issue resolved`, 
      { name: 'Resolution Complete', description: `${serviceType} issue successfully resolved` });
  }
  
  builder.addEdge(knowledgeBaseId, satisfactionId, 'information provided', 
    { name: 'Information Complete', description: 'Knowledge base information provided' });
  
  builder.addEdge(satisfactionId, completionId, 'satisfaction survey complete', 
    { name: 'Survey Complete', description: 'Customer satisfaction survey completed' });

  return builder.build();
}

// Intelligent Appointment System Builder
function buildIntelligentAppointmentSystem(args: any): { nodes: PathwayNode[], edges: PathwayEdge[] } {
  const builder = new ModularPathwayBuilder();
  
  // 1. GLOBAL RESCHEDULING NODE
  const rescheduleNodeId = builder.addNode(
    builder.createNode('Appointment Rescheduling')
      .asGlobal('reschedule', {
        trigger_keywords: ['reschedule', 'change appointment', 'different time', 'cancel', 'move appointment'],
        priority_level: 8,
        interrupt_any_node: true,
        return_to_previous: true
      })
      .withPrompt(`I can help you reschedule your appointment. Let me check availability for a better time.
                   ${args.rescheduling_allowed ? 'Rescheduling is available up to 24 hours before your appointment.' : ''}`)
      .withVariableExtraction([
        ['current_appointment_id', 'string', 'Current appointment reference', false],
        ['preferred_new_time', 'string', 'Preferred new appointment time', true],
        ['reason_for_change', 'string', 'Reason for rescheduling', false]
      ])
  );

  // 2. APPOINTMENT BOOKING HUB
  const bookingHubId = builder.addNode(
    builder.createNode(`${args.business_name} Appointment Booking`)
      .asStart()
      .withPrompt(`Welcome to ${args.business_name}! I'm here to help you schedule an appointment.
                   We offer: ${args.service_types.join(', ')}.
                   Our hours are ${args.business_hours}.
                   What type of service are you looking for?`)
      .withVariableExtraction([
        ['customer_name', 'string', 'Customer full name', true],
        ['customer_phone', 'string', 'Customer phone number', true],
        ['customer_email', 'string', 'Customer email address', true],
        ['service_requested', 'string', 'Type of service needed', true],
        ['preferred_date', 'string', 'Preferred appointment date', true],
        ['preferred_time', 'string', 'Preferred appointment time', true]
      ])
      .withAIFeatures({
        sentiment_analysis: true,
        language_detection: true,
        conversation_insights: true
      })
  );

  // 3. SERVICE SELECTION & PRICING
  const serviceSelectionId = builder.addNode(
    builder.createNode('Service Selection & Information')
      .withPrompt(`Perfect! Let me provide you with detailed information about our ${args.service_types.join(' and ')} services,
                   including duration, pricing, and what to expect during your appointment.`)
      .withCustomTools([
        {
          name: 'service_pricing_calculator',
          description: 'Calculate service pricing and duration',
          input_schema: {
            type: 'object',
            properties: {
              service_type: { type: 'string' },
              customer_type: { type: 'string' },
              add_ons: { type: 'array', items: { type: 'string' } }
            },
            required: ['service_type']
          },
          speech: 'Let me calculate the pricing and duration for your service...',
          response_data: [
            { name: 'service_price', data: '$.price' },
            { name: 'service_duration', data: '$.duration' },
            { name: 'available_add_ons', data: '$.add_ons' }
          ]
        }
      ])
  );

  // 4. AVAILABILITY CHECKING
  const availabilityId = builder.addNode(
    builder.createNode('Real-Time Availability Checker')
      .withPrompt('Let me check our real-time availability for your preferred date and time...')
      .withDynamicData([
        {
          url: args.booking_webhook || 'https://api.calendar.com/availability',
          method: 'GET',
          query: {
            date: '{{preferred_date}}',
            service_type: '{{service_requested}}',
            duration: '{{service_duration}}'
          },
          response_data: [
            { name: 'available_slots', data: '$.available_times' },
            { name: 'next_available', data: '$.next_available_date' }
          ],
          error_handling: {
            on_error: 'continue',
            fallback_response: 'Let me manually check our availability for you.'
          }
        }
      ])
      .withCondition('Service selected and preferred time provided')
  );

  // 5. APPOINTMENT CONFIRMATION
  const confirmationId = builder.addNode(
    builder.createNode('Appointment Confirmation')
      .withPrompt(`Excellent! I have an available slot for ${args.service_types[0]} on {{preferred_date}} at {{preferred_time}}.
                   The service will take approximately {{service_duration}} and costs {{service_price}}.
                   Shall I confirm this appointment for you?`)
      .withVariableExtraction([
        ['confirmation_agreed', 'boolean', 'Customer confirms appointment', true],
        ['special_requests', 'string', 'Any special requests or notes', false],
        ['preferred_reminder_method', 'string', 'How to send reminders', false]
      ])
      .withCondition('Available slot found')
  );

  // 6. BOOKING COMPLETION
  const bookingCompleteId = builder.addNode(
    builder.createNode('Booking Completion & Confirmation')
      .withPrompt(`Perfect! Your appointment is confirmed for {{preferred_date}} at {{preferred_time}}.
                   ${args.confirmation_method === 'email' ? 'You\'ll receive an email confirmation' : 
                     args.confirmation_method === 'sms' ? 'You\'ll receive an SMS confirmation' : 
                     'You\'ll receive both email and SMS confirmations'}.
                   ${args.automated_reminders ? 'We\'ll also send you reminders before your appointment.' : ''}`)
      .withDynamicData([
        {
          url: args.booking_webhook || 'https://api.booking.com/confirm',
          method: 'POST',
          body: {
            customer_name: '{{customer_name}}',
            customer_email: '{{customer_email}}',
            customer_phone: '{{customer_phone}}',
            service_type: '{{service_requested}}',
            appointment_date: '{{preferred_date}}',
            appointment_time: '{{preferred_time}}',
            price: '{{service_price}}',
            duration: '{{service_duration}}'
          },
          response_data: [
            { name: 'appointment_id', data: '$.booking_id' },
            { name: 'confirmation_number', data: '$.confirmation_code' }
          ]
        }
      ])
      .withAnalytics({
        track_completion: true,
        custom_events: [
          { event_name: 'appointment_booked', trigger_condition: 'node_completed', 
            data: { service: '{{service_requested}}', date: '{{preferred_date}}' } }
        ]
      })
  );

  // 7. ALTERNATIVE TIMES
  const alternativeTimesId = builder.addNode(
    builder.createNode('Alternative Time Options')
      .withPrompt(`I don't have availability at your preferred time, but I have these alternative options:
                   {{available_slots}}. The next available appointment is {{next_available}}.
                   Which of these alternatives works better for you?`)
      .withVariableExtraction([
        ['selected_alternative', 'string', 'Chosen alternative time', true]
      ])
      .withCondition('Preferred time not available')
  );

  // 8. COMPLETION NODE
  const completionId = builder.addNode(
    builder.createNode('Appointment Booking Complete')
      .asEndCall()
      .withPrompt(`Thank you for booking with ${args.business_name}! Your appointment confirmation number is {{confirmation_number}}.
                   We look forward to seeing you on {{preferred_date}}. Have a great day!`)
  );

  // BUILD INTELLIGENT ROUTING
  builder.addEdge(bookingHubId, serviceSelectionId, 'service interest expressed', 
    { name: 'Service Selection', description: 'Customer interested in specific service' });
  
  builder.addEdge(serviceSelectionId, availabilityId, 'service selected', 
    { name: 'Check Availability', description: 'Service chosen, checking availability' });
  
  builder.addEdge(availabilityId, confirmationId, 'preferred time available', 
    { name: 'Time Available', description: 'Preferred slot is available' });
  
  builder.addEdge(availabilityId, alternativeTimesId, 'preferred time not available', 
    { name: 'No Availability', description: 'Preferred time unavailable, offering alternatives' });
  
  builder.addEdge(alternativeTimesId, confirmationId, 'alternative time selected', 
    { name: 'Alternative Chosen', description: 'Customer selected alternative time' });
  
  builder.addEdge(confirmationId, bookingCompleteId, 'appointment confirmed', 
    { name: 'Confirmation Complete', description: 'Customer confirmed the appointment' });
  
  builder.addEdge(bookingCompleteId, completionId, 'booking process complete', 
    { name: 'Process Complete', description: 'Appointment successfully booked' });

  return builder.build();
}

// Custom Workflow Pathway Builder
function buildCustomWorkflowPathway(args: any): { nodes: PathwayNode[], edges: PathwayEdge[] } {
  const builder = new ModularPathwayBuilder();
  
  // 1. GLOBAL HELP NODE
  const helpNodeId = builder.addNode(
    builder.createNode('Workflow Help Assistant')
      .asGlobal('help', {
        trigger_keywords: ['help', 'confused', 'lost', 'what next', 'explain'],
        priority_level: 10,
        interrupt_any_node: true,
        return_to_previous: true
      })
      .withPrompt('I\'m here to help guide you through our workflow. What specific assistance do you need?')
  );

  // 2. WORKFLOW ENTRY POINT
  const entryId = builder.addNode(
    builder.createNode('Custom Workflow Entry')
      .asStart()
      .withPrompt(args.workflow_description)
      .withVariableExtraction(
        args.required_data_points?.map((point: string, index: number) => [
          point.toLowerCase().replace(/\s+/g, '_'),
          'string',
          point,
          index < 3 // First 3 are required
        ]) || [
          ['workflow_intent', 'string', 'Purpose of workflow interaction', true],
          ['customer_context', 'string', 'Customer context or background', false]
        ]
      )
      .withAIFeatures({
        sentiment_analysis: args.advanced_features?.variable_extraction || true,
        conversation_insights: args.advanced_features?.conditional_logic || true
      })
  );

  // 3. CREATE DECISION NODES FOR EACH DECISION POINT
  const decisionNodes: Record<string, string> = {};
  
  if (args.decision_points && args.decision_points.length > 0) {
    for (let i = 0; i < args.decision_points.length; i++) {
      const decisionPoint = args.decision_points[i];
      const decisionId = builder.addNode(
        builder.createNode(`Decision Point: ${decisionPoint}`)
          .withPrompt(`Based on your information, I need to make a decision about: ${decisionPoint}
                       Let me analyze your requirements to determine the best path forward.`)
          .withCondition(`${decisionPoint} decision required`)
          .withCustomTools([
            {
              name: 'decision_engine',
              description: `Make decision for ${decisionPoint}`,
              input_schema: {
                type: 'object',
                properties: {
                  decision_criteria: { type: 'string' },
                  customer_data: { type: 'object' }
                },
                required: ['decision_criteria']
              },
              speech: `Let me analyze the best approach for ${decisionPoint}...`,
              response_data: [
                { name: 'decision_result', data: '$.decision' },
                { name: 'confidence_score', data: '$.confidence' }
              ]
            }
          ])
      );
      decisionNodes[decisionPoint] = decisionId;
    }
  }

  // 4. WORKFLOW PROCESSOR
  const processorId = builder.addNode(
    builder.createNode('Workflow Processor')
      .withPrompt('Now I\'ll process your workflow based on the information and decisions made.')
      .withDynamicData([
        {
          url: 'https://api.workflow.com/process',
          method: 'POST',
          body: {
            workflow_type: args.name,
            customer_data: '{{workflow_intent}}',
            decisions: '{{decision_results}}'
          },
          response_data: [
            { name: 'workflow_result', data: '$.result' },
            { name: 'next_steps', data: '$.next_steps' }
          ],
          error_handling: {
            on_error: 'continue',
            fallback_response: 'I\'ll process this manually for you.'
          }
        }
      ])
  );

  // 5. GLOBAL FALLBACK NODE if enabled
  let fallbackNodeId = null;
  if (args.advanced_features?.global_fallbacks) {
    fallbackNodeId = builder.addNode(
      builder.createNode('Workflow Fallback Handler')
        .asGlobal('fallback', {
          trigger_keywords: ['error', 'problem', 'not working', 'issue'],
          priority_level: 5,
          interrupt_any_node: true,
          return_to_previous: false
        })
        .withPrompt('I notice there might be an issue with the workflow. Let me help resolve this and get you back on track.')
    );
  }

  // 6. RESULTS & COMPLETION
  const resultsId = builder.addNode(
    builder.createNode('Workflow Results')
      .withPrompt(`Great! Your workflow has been completed successfully.
                   Results: {{workflow_result}}
                   Next steps: {{next_steps}}`)
      .withAnalytics({
        track_completion: true,
        track_duration: true,
        custom_events: [
          { event_name: 'custom_workflow_completed', trigger_condition: 'node_completed', 
            data: { workflow_name: args.name } }
        ]
      })
  );

  // 7. COMPLETION NODE
  const completionId = builder.addNode(
    builder.createNode('Workflow Complete')
      .asEndCall()
      .withPrompt('Thank you for using our custom workflow system! Your process has been completed successfully.')
  );

  // BUILD DYNAMIC ROUTING
  let currentNodeId = entryId;
  
  // Chain decision points if they exist
  if (args.decision_points && args.decision_points.length > 0) {
    for (let i = 0; i < args.decision_points.length; i++) {
      const decisionPoint = args.decision_points[i];
      const nextNodeId = i < args.decision_points.length - 1 ? 
        decisionNodes[args.decision_points[i + 1]] : processorId;
      
      builder.addEdge(currentNodeId, decisionNodes[decisionPoint], 
        `${decisionPoint} decision needed`, 
        { name: `Decision ${i + 1}`, description: `Route to ${decisionPoint} decision` });
      
      builder.addEdge(decisionNodes[decisionPoint], nextNodeId, 
        `${decisionPoint} decision made`, 
        { name: 'Decision Complete', description: `${decisionPoint} decision completed` });
      
      currentNodeId = decisionNodes[decisionPoint];
    }
  } else {
    // Direct route to processor if no decision points
    builder.addEdge(entryId, processorId, 'workflow ready for processing', 
      { name: 'Processing Route', description: 'Route to workflow processor' });
  }

  builder.addEdge(processorId, resultsId, 'workflow processing complete', 
    { name: 'Results Ready', description: 'Workflow processing completed' });
  
  builder.addEdge(resultsId, completionId, 'results delivered', 
    { name: 'Workflow Complete', description: 'Results delivered to customer' });

  return builder.build();
}

export function createPathwayTools(blandClient: BlandAIClient) {
  return [
    {
      name: 'create_modular_pathway',
      description: 'Create ANY type of conversational pathway from natural language description using modular building blocks. This is the universal pathway creator that can handle any request.',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(20).max(5000).describe('Natural language description of what the pathway should do'),
        
        // FIXED: Use string inputs that can be parsed instead of complex objects/arrays
        webhook_integrations: z.string().optional().describe('JSON string of webhook integrations array'),
        knowledge_bases: z.string().optional().describe('JSON string of knowledge bases array'),
        transfer_numbers: z.string().optional().describe('JSON string of transfer numbers array'),
        variable_collection: z.string().optional().describe('JSON string of variable collection array'),
        conditions: z.string().optional().describe('JSON string of conditions array'),
        global_features: z.string().optional().describe('JSON string of global features object'),
        advanced_features: z.string().optional().describe('JSON string of advanced features object')
      }),
      
      handler: async (args: any) => {
        try {
          // FIXED: Parse JSON string inputs back to objects/arrays with fallbacks
          let parsedArgs = { ...args };

          try {
            if (args.webhook_integrations && typeof args.webhook_integrations === 'string') {
              parsedArgs.webhook_integrations = JSON.parse(args.webhook_integrations);
            }
          } catch (e) {
            console.warn('Failed to parse webhook_integrations:', e);
            parsedArgs.webhook_integrations = [];
          }

          try {
            if (args.knowledge_bases && typeof args.knowledge_bases === 'string') {
              parsedArgs.knowledge_bases = JSON.parse(args.knowledge_bases);
            }
          } catch (e) {
            console.warn('Failed to parse knowledge_bases:', e);
            parsedArgs.knowledge_bases = [];
          }

          try {
            if (args.transfer_numbers && typeof args.transfer_numbers === 'string') {
              parsedArgs.transfer_numbers = JSON.parse(args.transfer_numbers);
            }
          } catch (e) {
            console.warn('Failed to parse transfer_numbers:', e);
            parsedArgs.transfer_numbers = [];
          }

          try {
            if (args.variable_collection && typeof args.variable_collection === 'string') {
              parsedArgs.variable_collection = JSON.parse(args.variable_collection);
            }
          } catch (e) {
            console.warn('Failed to parse variable_collection:', e);
            parsedArgs.variable_collection = [];
          }

          try {
            if (args.conditions && typeof args.conditions === 'string') {
              parsedArgs.conditions = JSON.parse(args.conditions);
            }
          } catch (e) {
            console.warn('Failed to parse conditions:', e);
            parsedArgs.conditions = [];
          }

          try {
            if (args.global_features && typeof args.global_features === 'string') {
              parsedArgs.global_features = JSON.parse(args.global_features);
            }
          } catch (e) {
            console.warn('Failed to parse global_features:', e);
            parsedArgs.global_features = { help_node: true, fallback_handling: true, interruption_handling: true };
          }

          try {
            if (args.advanced_features && typeof args.advanced_features === 'string') {
              parsedArgs.advanced_features = JSON.parse(args.advanced_features);
            }
          } catch (e) {
            console.warn('Failed to parse advanced_features:', e);
            parsedArgs.advanced_features = { fine_tuning: false, model_customization: false, dynamic_routing: true };
          }

          // Create basic pathway first
          const basicPathway = await blandClient.createPathway(args.name, args.description);
          
          // FIXED: Use DomainSpecificBranchingBuilder for TRUE domain-specific routing
          const domainBuilder = new DomainSpecificBranchingBuilder();
          const pathwayStructure = domainBuilder.buildFromDescription(args.description, parsedArgs);
          
          // Update pathway with domain-specific structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            args.description,
            pathwayStructure.nodes,
            pathwayStructure.edges
          );
          
          // Calculate domain-specific analytics
          const branchingAnalysis = analyzeBranchingComplexity(pathwayStructure);
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created domain-specific modular pathway "${args.name}" with ${pathwayStructure.nodes.length} nodes and TRUE conditional branching`,
            modular_analysis: {
              total_nodes: pathwayStructure.nodes.length,
              total_edges: pathwayStructure.edges.length,
              branching_points: branchingAnalysis.branchingPoints,
              max_branches_from_single_node: branchingAnalysis.maxBranches,
              conditional_routing_paths: branchingAnalysis.conditionalPaths,
              webhook_integrations: parsedArgs.webhook_integrations?.length || 0,
              knowledge_bases: parsedArgs.knowledge_bases?.length || 0,
              transfer_numbers: parsedArgs.transfer_numbers?.length || 0,
              domain_specific: true,
              truly_customizable: true
            },
            pathway_capabilities: [
              'Domain-specific concept detection from natural language',
              'TRUE conditional branching customized to exact domain', 
              'Dynamic decision-based routing specific to use case',
              'Priority-based routing within domain context',
              'Domain-specialized node creation',
              'Conditional webhook integration for domain needs',
              'Context-aware knowledge base triggers for domain',
              'Advanced domain-specific variable extraction',
              'Fully customizable modular composition',
              'Unlimited domain customization potential'
            ],
            branching_structure: {
              decision_hub: 'Domain-specific intelligent routing hub',
              specialist_nodes: branchingAnalysis.specialistTypes,
              routing_conditions: branchingAnalysis.routingConditions,
              fallback_paths: 'Domain-specific resolution and completion paths'
            }
          };
          
        } catch (error: any) {
          console.error('Error creating modular pathway:', error);
          return {
            success: false,
            error: error.message,
            message: `Failed to create modular pathway "${args.name}"`
          };
        }
      }
    },

    {
      name: 'create_unlimited_complexity_pathway',
      description: 'Create ANY pathway with UNLIMITED complexity using ALL Bland AI features - dynamic data, custom tools, AI features, fine-tuning, wait nodes, advanced global nodes, analytics, and everything else. This is the ultimate pathway creator.',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(20).max(5000).describe('Natural language description of what the pathway should do'),
        
        // Advanced Feature Configurations
        enable_dynamic_data: z.coerce.boolean().default(true).describe('Enable real-time API calls during conversations'),
        enable_custom_tools: z.coerce.boolean().default(true).describe('Enable custom tool execution'),
        enable_ai_features: z.coerce.boolean().default(true).describe('Enable sentiment analysis, emotion detection, etc.'),
        enable_fine_tuning: z.coerce.boolean().default(true).describe('Enable fine-tuning examples'),
        enable_wait_nodes: z.coerce.boolean().default(false).describe('Include wait for response nodes'),
        enable_analytics: z.coerce.boolean().default(true).describe('Enable comprehensive analytics tracking'),
        
        // Configuration strings that can be parsed
        webhook_integrations: z.string().optional().describe('JSON string of webhook integrations'),
        knowledge_bases: z.string().optional().describe('JSON string of knowledge bases'),
        transfer_numbers: z.string().optional().describe('JSON string of transfer numbers'),
        custom_tools_config: z.string().optional().describe('JSON string of custom tools configuration'),
        dynamic_data_config: z.string().optional().describe('JSON string of dynamic data sources'),
        voice_settings: z.string().optional().describe('JSON string of voice configuration'),
        model_settings: z.string().optional().describe('JSON string of model configuration'),
        analytics_config: z.string().optional().describe('JSON string of analytics configuration')
      }),
      
      handler: async (args: any) => {
        try {
          // Parse all configuration strings
          const config = parseAllConfigurations(args);

          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, args.description);
          
          // Build unlimited complexity structure using ALL features
          const unlimitedComplexityStructure = buildUnlimitedComplexityPathway(args, config);
          
          // Update pathway with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            args.description,
            unlimitedComplexityStructure.nodes,
            unlimitedComplexityStructure.edges
          );
          
          const analytics = analyzeUnlimitedComplexity(unlimitedComplexityStructure);
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created UNLIMITED COMPLEXITY pathway "${args.name}" with ALL Bland AI features`,
            unlimited_features: {
              total_nodes: unlimitedComplexityStructure.nodes.length,
              total_edges: unlimitedComplexityStructure.edges.length,
              dynamic_data_sources: config.dynamic_data_sources?.length || 0,
              custom_tools: config.custom_tools?.length || 0,
              webhook_integrations: config.webhook_integrations?.length || 0,
              knowledge_bases: config.knowledge_bases?.length || 0,
              ai_features_enabled: args.enable_ai_features,
              fine_tuning_enabled: args.enable_fine_tuning,
              analytics_enabled: args.enable_analytics,
              wait_nodes_enabled: args.enable_wait_nodes,
              branching_complexity: analytics.complexity_score,
              supports_unlimited_customization: true
            },
            all_bland_features_supported: [
              'Real-time dynamic data integration',
              'Custom tools execution',
              'Advanced AI features (sentiment, emotion, language detection)',
              'Comprehensive fine-tuning examples',
              'Wait for response nodes with timeout handling',
              'Advanced global nodes with keyword triggers',
              'Complete analytics and event tracking',
              'Advanced voice settings and pronunciation',
              'Model optimization and interruption control',
              'Unlimited conditional branching',
              'Domain-specific intelligent routing',
              'Context-aware variable extraction',
              'Error handling and fallback strategies',
              'Multi-level escalation logic',
              'Real-time conversation insights',
              'Unlimited pathway complexity'
            ]
          };
          
        } catch (error: any) {
          console.error('Error creating unlimited complexity pathway:', error);
          return {
            success: false,
            error: error.message,
            message: `Failed to create unlimited complexity pathway "${args.name}"`
          };
        }
      }
    },

    {
      name: 'create_enterprise_sales_pathway',
      description: 'Create a sophisticated enterprise sales pathway with qualification, objection handling, decision routing, and CRM integration',
      inputSchema: z.object({
        name: z.string().default('Enterprise Sales System'),
        company_name: z.string(),
        product_or_service: z.string(),
        price_range: z.string().optional(),
        qualification_criteria: z.string().default('budget, authority, need, timeline'),
        objection_handling: z.string().default('Common concerns include pricing, implementation, and ROI. Let me provide detailed information.'),
        transfer_number: z.string().optional(),
        webhook_url: z.string().optional(),
        lead_scoring: z.string().default('Score based on company size, budget authority, timeline, and technical requirements.')
      }),
      handler: async (args: any) => {
        try {
          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, `Enterprise sales pathway for ${args.company_name}`);
          
          // Build enterprise sales structure
          const salesStructure = buildEnterpriseSalesPathway(args);
          
          // Update with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            `Sophisticated enterprise sales pathway for ${args.company_name} with full qualification, objection handling, and intelligent routing`,
            salesStructure.nodes,
            salesStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created enterprise sales pathway for ${args.company_name} with sophisticated qualification and routing logic`,
            features: [
              'Multi-stage qualification process',
              'Advanced objection handling with global nodes',
              'Dynamic lead scoring',
              'Intelligent decision routing',
              'CRM integration ready',
              'Variable extraction for all key data',
              'Condition-based flow control'
            ]
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create enterprise sales pathway for ${args.company_name}`
          };
        }
      }
    },

    {
      name: 'create_ai_customer_service_pathway',
      description: 'Create an advanced AI customer service pathway with intelligent routing, escalation logic, and knowledge base integration',
      inputSchema: z.object({
        name: z.string().default('AI Customer Service System'),
        company_name: z.string(),
        service_types: z.string().default('billing,technical,general,account,emergency,crisis').describe('Comma-separated list of service types'),
        knowledge_base_content: z.string().optional(),
        escalation_number: z.string().optional(),
        resolution_webhook: z.string().optional(),
        satisfaction_tracking: z.coerce.boolean().default(true)
      }),
      handler: async (args: any) => {
        try {
          // Parse service_types string into array
          const serviceTypesArray = typeof args.service_types === 'string' 
            ? args.service_types.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
            : Array.isArray(args.service_types) 
            ? args.service_types 
            : ['billing', 'technical', 'general', 'account'];

          // Create args object with parsed arrays
          const parsedArgs = {
            ...args,
            service_types: serviceTypesArray
          };

          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, `Advanced AI customer service for ${args.company_name}`);
          
          // Build customer service structure
          const serviceStructure = buildAdvancedCustomerServicePathway(parsedArgs);
          
          // Update with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            `Advanced AI customer service pathway for ${args.company_name} with intelligent routing and resolution tracking`,
            serviceStructure.nodes,
            serviceStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created advanced customer service pathway for ${args.company_name} with intelligent routing and escalation`,
            features: [
              'Intelligent issue classification',
              'Dynamic knowledge base integration',
              'Multi-tier escalation logic',
              'Satisfaction tracking',
              'Resolution automation',
              'Context-aware responses',
              'Performance analytics ready'
            ]
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create customer service pathway for ${args.company_name}`
          };
        }
      }
    },

    {
      name: 'create_intelligent_appointment_system',
      description: 'Create a sophisticated appointment booking system with availability checking, confirmation workflows, and reminder automation',
      inputSchema: z.object({
        name: z.string().default('Intelligent Appointment System'),
        business_name: z.string(),
        service_types: z.string().describe('Comma-separated list of service types (e.g., consultation,therapy,checkup,emergency)'),
        business_hours: z.string().default('9 AM to 5 PM, Monday to Friday'),
        booking_webhook: z.string().optional(),
        confirmation_method: z.enum(['email', 'sms', 'both']).default('both'),
        automated_reminders: z.coerce.boolean().default(true),
        rescheduling_allowed: z.coerce.boolean().default(true)
      }),
      handler: async (args: any) => {
        try {
          // Parse service_types string into array
          const serviceTypesArray = typeof args.service_types === 'string' 
            ? args.service_types.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
            : Array.isArray(args.service_types) 
            ? args.service_types 
            : ['consultation', 'appointment'];

          // Create args object with parsed arrays
          const parsedArgs = {
            ...args,
            service_types: serviceTypesArray
          };

          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, `Intelligent appointment system for ${args.business_name}`);
          
          // Build appointment system structure
          const appointmentStructure = buildIntelligentAppointmentSystem(parsedArgs);
          
          // Update with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            `Sophisticated appointment booking system for ${args.business_name} with automated workflows`,
            appointmentStructure.nodes,
            appointmentStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created intelligent appointment system for ${args.business_name} with full automation`,
            features: [
              'Real-time availability checking',
              'Service selection with dynamic pricing',
              'Multi-step confirmation workflow',
              'Automated reminder system',
              'Rescheduling and cancellation logic',
              'Customer preference tracking',
              'Calendar integration ready'
            ]
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create appointment system for ${args.business_name}`
          };
        }
      }
    },

    {
      name: 'create_custom_workflow_pathway',
      description: 'Create a completely custom workflow pathway based on detailed natural language specifications',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        workflow_description: z.string().min(50).max(3000),
        required_data_points: z.string().optional().describe('Comma-separated list of data points to collect'),
        decision_points: z.string().optional().describe('Comma-separated list of decision points'),
        integrations_config: z.string().optional().describe('Integration configuration as JSON string or comma-separated list'),
        enable_variable_extraction: z.coerce.boolean().default(true),
        enable_conditional_logic: z.coerce.boolean().default(true),
        enable_global_fallbacks: z.coerce.boolean().default(true),
        enable_fine_tuning: z.coerce.boolean().default(false)
      }),
      handler: async (args: any) => {
        try {
          // Parse string inputs into arrays/objects
          const requiredDataPoints = args.required_data_points 
            ? (typeof args.required_data_points === 'string' 
                ? args.required_data_points.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
                : args.required_data_points)
            : [];

          const decisionPoints = args.decision_points 
            ? (typeof args.decision_points === 'string' 
                ? args.decision_points.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
                : args.decision_points)
            : [];

          // Create parsed args
          const parsedArgs = {
            ...args,
            required_data_points: requiredDataPoints,
            decision_points: decisionPoints,
            advanced_features: {
              variable_extraction: args.enable_variable_extraction,
              conditional_logic: args.enable_conditional_logic,
              global_fallbacks: args.enable_global_fallbacks,
              fine_tuning_examples: args.enable_fine_tuning
            }
          };

          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, args.workflow_description);
          
          // Build custom workflow structure
          const customStructure = buildCustomWorkflowPathway(parsedArgs);
          
          // Update with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            args.workflow_description,
            customStructure.nodes,
            customStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created custom workflow pathway "${args.name}" with sophisticated logic and integrations`,
            pathway_details: {
              nodes_created: customStructure.nodes.length,
              edges_created: customStructure.edges.length,
              integrations_configured: 0,
              data_points_tracked: requiredDataPoints.length,
              decision_points: decisionPoints.length,
              fully_customized: true
            }
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create custom workflow pathway "${args.name}"`
          };
        }
      }
    },

    {
      name: 'list_pathways',
      description: 'List all available conversation pathways',
      inputSchema: z.object({}),
      handler: async () => {
        try {
          const pathways = await blandClient.listPathways();
          return pathways.map(pathway => ({
            pathway_id: pathway.pathway_id,
            name: pathway.name,
            description: pathway.description,
            created_at: pathway.created_at
          }));
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: 'Failed to list pathways'
          };
        }
      }
    },

    {
      name: 'get_pathway_details',
      description: 'Get detailed information about a specific pathway including full node and edge structure',
      inputSchema: z.object({
        pathway_id: z.string()
      }),
      handler: async (args: any) => {
        try {
          const pathway = await blandClient.getPathway(args.pathway_id);
          return {
            pathway_id: pathway.pathway_id,
            name: pathway.name,
            description: pathway.description,
            nodes: pathway.nodes,
            edges: pathway.edges,
            nodes_count: pathway.nodes?.length || 0,
            edges_count: pathway.edges?.length || 0,
            has_conditions: pathway.nodes?.some((n: any) => n.data?.condition) || false,
            has_webhooks: pathway.nodes?.some((n: any) => n.type === 'Webhook') || false,
            has_global_nodes: pathway.nodes?.some((n: any) => n.data?.isGlobal) || false,
            created_at: pathway.created_at,
            updated_at: pathway.updated_at
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to get details for pathway ${args.pathway_id}`
          };
        }
      }
    },

    {
      name: 'delete_pathway',
      description: 'Delete a conversation pathway',
      inputSchema: z.object({
        pathway_id: z.string()
      }),
      handler: async (args: any) => {
        try {
          const result = await blandClient.deletePathway(args.pathway_id);
          return {
            success: result.success,
            message: `Deleted pathway ${args.pathway_id}`
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to delete pathway ${args.pathway_id}`
          };
        }
      }
    }
  ];
}

// DOMAIN-SPECIFIC MODULAR PATHWAY BUILDER - Creates SPECIFIC pathways from natural language
class DomainSpecificBranchingBuilder {
  private nodes: PathwayNode[] = [];
  private edges: PathwayEdge[] = [];
  private nodeCount = 0;
  private edgeCount = 0;
  private nodeMap: Map<string, string> = new Map();
  private domain: string = '';
  private primaryPurpose: string = '';

  // Parse description and create domain-specific branching structure
  buildFromDescription(description: string, args: any): { nodes: PathwayNode[], edges: PathwayEdge[] } {
    // 1. Extract the primary domain and purpose from description
    this.domain = this.extractPrimaryDomain(description, args.name);
    this.primaryPurpose = this.extractPrimaryPurpose(description);
    
    // 2. Extract domain-specific branching concepts
    const domainConcepts = this.extractDomainSpecificConcepts(description, this.domain);
    
    // 3. Create domain-specific decision hub
    const hubId = this.createDomainSpecificHub(domainConcepts);
    
    // 4. Create specialized nodes for each domain concept and store actual IDs
    const conceptNodeIds: Map<string, string> = new Map();
    for (const concept of domainConcepts) {
      const nodeId = this.createDomainConceptNode(concept, args);
      conceptNodeIds.set(concept.type, nodeId);
      
      // FIXED: Create conditional edge using the ACTUAL nodeId returned
      this.createConditionalEdge(hubId, nodeId, concept.condition, concept.description);
    }
    
    // 5. Add domain-specific webhook integrations
    if (args.webhook_integrations?.length > 0) {
      for (const webhook of args.webhook_integrations) {
        const webhookId = this.createDomainWebhookNode(webhook);
        this.createConditionalEdge(hubId, webhookId, 
          `needs ${webhook.name.toLowerCase()}`, 
          `Route to ${webhook.name} for domain-specific processing`);
      }
    }
    
    // 6. Add domain-specific knowledge base routing
    if (args.knowledge_bases?.length > 0) {
      for (const kb of args.knowledge_bases) {
        const kbId = this.createDomainKnowledgeBaseNode(kb);
        const triggerCondition = kb.trigger_phrases?.join(' or ') || `questions about ${kb.name.toLowerCase()}`;
        this.createConditionalEdge(hubId, kbId, 
          `asks about ${triggerCondition}`, 
          `Provide specialized information from ${kb.name}`);
      }
    }
    
    // 7. Add domain-specific transfer routing
    if (args.transfer_numbers?.length > 0) {
      for (const transfer of args.transfer_numbers) {
        const transferId = this.createDomainTransferNode(transfer);
        const conditions = transfer.conditions?.join(' or ') || `needs ${transfer.name.toLowerCase()}`;
        this.createConditionalEdge(hubId, transferId, conditions, 
          `Transfer to ${transfer.name} for specialized assistance`);
      }
    }
    
    // 8. Create domain-specific resolution and completion
    const resolutionId = this.createDomainResolutionNode();
    const completionId = this.createDomainCompletionNode();
    
    // FIXED: Create resolution paths from all actual domain concept nodes
    for (const [conceptType, nodeId] of conceptNodeIds) {
      this.createConditionalEdge(nodeId, resolutionId, 
        `${conceptType} assistance complete`, 
        `Complete ${conceptType} assistance and assess satisfaction`);
    }
    
    // FIXED: Also create resolution paths from webhook, KB, and transfer nodes  
    if (args.webhook_integrations?.length > 0 || args.knowledge_bases?.length > 0 || args.transfer_numbers?.length > 0) {
      // Get all non-hub, non-resolution, non-completion node IDs
      const otherNodeIds = this.nodes
        .filter(node => node.id !== hubId && node.id !== resolutionId && node.id !== completionId)
        .filter(node => !conceptNodeIds.has(node.id))
        .map(node => node.id);
      
      for (const nodeId of otherNodeIds) {
        this.createConditionalEdge(nodeId, resolutionId, 
          `service completed successfully`, 
          `Complete service and assess customer satisfaction`);
      }
    }
    
    // Completion routing
    this.createConditionalEdge(resolutionId, completionId, 
      `satisfied with ${this.domain} service`, `Complete ${this.domain} interaction`);
    this.createConditionalEdge(resolutionId, hubId, 
      `additional ${this.domain} needs`, `Return to ${this.domain} options`);
    
    return { nodes: this.nodes, edges: this.edges };
  }
  
  private extractPrimaryDomain(description: string, name: string): string {
    const combined = (description + ' ' + name).toLowerCase();
    
    // Health Insurance
    if (this.containsAny(combined, ['health insurance', 'medical insurance', 'healthcare', 'insurance sales'])) {
      return 'health insurance';
    }
    // Real Estate
    if (this.containsAny(combined, ['real estate', 'property', 'home sales', 'mortgage', 'realtor'])) {
      return 'real estate';
    }
    // Financial Services
    if (this.containsAny(combined, ['financial', 'investment', 'banking', 'loans', 'finance'])) {
      return 'financial services';
    }
    // E-commerce
    if (this.containsAny(combined, ['ecommerce', 'online store', 'shopping', 'retail', 'products'])) {
      return 'e-commerce';
    }
    // SaaS/Technology
    if (this.containsAny(combined, ['saas', 'software', 'technology', 'platform', 'app'])) {
      return 'technology';
    }
    // Default to custom business
    return this.extractBusinessType(combined);
  }
  
  private extractBusinessType(text: string): string {
    const words = text.split(' ');
    for (let i = 0; i < words.length - 1; i++) {
      if (['business', 'company', 'service', 'sales', 'system'].includes(words[i])) {
        return words[i + 1] || 'business';
      }
    }
    return 'specialized business';
  }
  
  private extractPrimaryPurpose(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (this.containsAny(lowerDesc, ['sales', 'selling', 'sell'])) return 'sales';
    if (this.containsAny(lowerDesc, ['support', 'service', 'help'])) return 'customer support';
    if (this.containsAny(lowerDesc, ['booking', 'appointment', 'schedule'])) return 'appointment booking';
    if (this.containsAny(lowerDesc, ['consultation', 'advisory', 'advice'])) return 'consultation';
    if (this.containsAny(lowerDesc, ['information', 'inquiry', 'questions'])) return 'information';
    
    return 'specialized assistance';
  }
  
  private extractDomainSpecificConcepts(description: string, domain: string): Array<{
    type: string;
    condition: string;
    description: string;
    priority: number;
  }> {
    const concepts = [];
    const lowerDesc = description.toLowerCase();
    
    if (domain === 'health insurance') {
      if (this.containsAny(lowerDesc, ['individual', 'single', 'personal'])) {
        concepts.push({
          type: 'individual_plans',
          condition: 'needs individual health insurance coverage',
          description: 'Individual health insurance plans and coverage options',
          priority: 1
        });
      }
      
      if (this.containsAny(lowerDesc, ['family', 'spouse', 'children', 'dependents'])) {
        concepts.push({
          type: 'family_coverage',
          condition: 'needs family health insurance coverage',
          description: 'Family health insurance plans and coverage options',
          priority: 1
        });
      }
      
      if (this.containsAny(lowerDesc, ['business', 'group', 'employer', 'employees'])) {
        concepts.push({
          type: 'group_business_plans',
          condition: 'needs business or group health insurance',
          description: 'Business and group health insurance solutions',
          priority: 2
        });
      }
      
      if (this.containsAny(lowerDesc, ['medicare', 'senior', 'retirement', '65'])) {
        concepts.push({
          type: 'medicare_senior_plans',
          condition: 'needs Medicare or senior health coverage',
          description: 'Medicare and senior health insurance options',
          priority: 1
        });
      }
      
      if (this.containsAny(lowerDesc, ['pre-existing', 'medical condition', 'chronic', 'specialist'])) {
        concepts.push({
          type: 'special_medical_needs',
          condition: 'has special medical needs or pre-existing conditions',
          description: 'Specialized coverage for medical conditions',
          priority: 1
        });
      }
      
      if (this.containsAny(lowerDesc, ['budget', 'affordable', 'cost', 'cheap', 'low-cost'])) {
        concepts.push({
          type: 'budget_plans',
          condition: 'looking for budget-friendly insurance options',
          description: 'Affordable health insurance solutions',
          priority: 2
        });
      }
      
      if (this.containsAny(lowerDesc, ['premium', 'comprehensive', 'best coverage', 'top-tier'])) {
        concepts.push({
          type: 'premium_coverage',
          condition: 'wants premium or comprehensive coverage',
          description: 'Premium health insurance with comprehensive benefits',
          priority: 2
        });
      }
    }
    
    // Add emergency/urgent handling for any domain
    if (this.containsAny(lowerDesc, ['urgent', 'immediate', 'emergency', 'asap', 'right away'])) {
      concepts.push({
        type: 'urgent_assistance',
        condition: 'needs immediate or urgent assistance',
        description: 'Urgent assistance and immediate support',
        priority: 0 // Highest priority
      });
    }
    
    // Sort by priority
    return concepts.sort((a, b) => a.priority - b.priority);
  }
  
  private createDomainSpecificHub(concepts: Array<any>): string {
    const hubId = `${this.domain.replace(/\s+/g, '_')}_hub_${++this.nodeCount}`;
    const conceptTypes = concepts.map(c => c.description).join(', ');
    
    this.nodes.push({
      id: hubId,
      type: 'Default',
      data: {
        name: `${this.capitalizeWords(this.domain)} ${this.capitalizeWords(this.primaryPurpose)} Hub`,
        type: 'Default',
        isStart: true,
        prompt: `Welcome! I'm your ${this.domain} ${this.primaryPurpose} specialist. 
                 I can help you with: ${conceptTypes}.
                 What specific ${this.domain} assistance do you need today?`,
        extractVars: [
          [`${this.domain.replace(/\s+/g, '_')}_need`, 'string', `Specific ${this.domain} requirement`],
          ['customer_category', 'string', 'Type of customer or situation'],
          ['urgency_level', 'string', 'How urgent their need is'],
          ['budget_range', 'string', 'Budget considerations if applicable']
        ]
      }
    });
    
    return hubId;
  }
  
  private createDomainConceptNode(concept: any, args: any): string {
    const nodeId = `${concept.type}_specialist_${++this.nodeCount}`;
    
    // Get domain-specific variables with required/optional flags
    const conceptVars = this.getDomainVariablesForConcept(concept.type, this.domain);
    
    // Create sophisticated node with ALL features using ModularNodeBuilder
    const nodeBuilder = new ModularNodeBuilder(nodeId, `${this.capitalizeWords(concept.type.replace(/_/g, ' '))} Specialist`)
      .asDefault()
      .withPrompt(`Perfect! I specialize in ${concept.description.toLowerCase()} for ${this.domain}.
                   Based on your ${this.domain} needs, let me provide you with the best options.
                   I'll gather some information to give you personalized recommendations.`)
      .withCondition(`Must fully address ${concept.type.replace(/_/g, ' ')} requirements`)
      .withVariableExtraction(conceptVars)
      .withAIFeatures({
        sentiment_analysis: true,
        emotion_detection: true,
        conversation_insights: true,
        caller_profiling: true
      })
      .withFlowControl({
        can_interrupt: true,
        requires_confirmation: false,
        retry_attempts: 3,
        escalation_threshold: 2,
        conversation_timeout: 1800 // 30 minutes
      })
      .withAnalytics({
        track_completion: true,
        track_duration: true,
        track_variables: true,
        track_sentiment: true,
        custom_events: [{
          event_name: `${concept.type}_interaction_started`,
          trigger_condition: 'node_entered',
          data: { concept_type: concept.type, domain: this.domain }
        }]
      });
    
    // Add domain-specific dynamic data integration
    if (this.domain === 'health insurance') {
      nodeBuilder.withDynamicData([
        {
          url: 'https://api.healthcare.gov/plans',
          method: 'GET',
          query: {
            state: '{{customer_state}}',
            age: '{{customer_age}}',
            income: '{{household_income}}'
          },
          cache: true,
          timeout: 5000,
          response_data: [
            {
              name: 'available_plans',
              data: '$.plans[*].name',
              context: 'Available insurance plans: {{available_plans}}'
            },
            {
              name: 'premium_estimates',
              data: '$.plans[*].premium',
              context: 'Premium estimates: {{premium_estimates}}'
            }
          ],
          error_handling: {
            on_error: 'continue',
            fallback_response: 'I\'ll provide general plan information instead.'
          }
        }
      ]);
      
      // Add custom tools for insurance calculations
      nodeBuilder.withCustomTools([
        {
          name: 'premium_calculator',
          description: 'Calculate personalized insurance premiums',
          input_schema: {
            type: 'object',
            properties: {
              age: { type: 'integer' },
              location: { type: 'string' },
              plan_type: { type: 'string' }
            },
            required: ['age', 'location', 'plan_type']
          },
          speech: 'Let me calculate your personalized premium...',
          response_data: [
            { name: 'calculated_premium', data: '$.monthly_premium' },
            { name: 'deductible', data: '$.annual_deductible' }
          ],
          timeout: 10000,
          error_handling: {
            on_error: 'continue',
            fallback_response: 'I\'ll provide general pricing estimates instead.'
          }
        }
      ]);
    }
    
    // Add fine-tuning examples based on domain
    if (this.domain === 'health insurance') {
      nodeBuilder.withFineTuning(
        [
          { userInput: 'I need affordable insurance', pathway: 'budget_plans' },
          { userInput: 'I have diabetes', pathway: 'special_medical_needs' },
          { userInput: 'Family of four', pathway: 'family_coverage' }
        ],
        [
          { userInput: 'I need insurance right away', conditionMet: true },
          { userInput: 'Just looking around', conditionMet: false }
        ],
        [
          { scenario: 'Customer mentions pre-existing condition', expectedResponse: 'I understand you have specific medical needs. Let me explain how our plans cover pre-existing conditions...' },
          { scenario: 'Customer asks about family coverage', expectedResponse: 'For family coverage, I\'ll need to understand your family size and specific needs...' }
        ]
      );
    }
    
    // FIXED: Build and add the node to our nodes array
    const builtNode = nodeBuilder.build();
    this.nodes.push(builtNode);
    
    // FIXED: Return the actual nodeId that was used
    return nodeId;
  }
  
  private getDomainVariablesForConcept(conceptType: string, domain: string): Array<[string, string, string, boolean?]> {
    const baseVars: Array<[string, string, string, boolean?]> = [
      [`${conceptType}_preference`, 'string', `Specific preferences for ${conceptType.replace(/_/g, ' ')}`, true],
      [`${conceptType}_timeline`, 'string', `Timeline for ${conceptType.replace(/_/g, ' ')}`, false]
    ];
    
    if (domain === 'health insurance') {
      switch (conceptType) {
        case 'individual_plans':
          return [...baseVars,
            ['current_health_status', 'string', 'Current health status and medical needs', true],
            ['preferred_deductible', 'string', 'Preferred deductible range', false],
            ['doctor_preferences', 'string', 'Preferred doctors or networks', false],
            ['monthly_budget', 'string', 'Monthly premium budget', true],
            ['prescription_medications', 'string', 'Current prescription medications', false],
            ['coverage_priorities', 'string', 'Most important coverage priorities', true]
          ];
        case 'family_coverage':
          return [...baseVars,
            ['family_size', 'integer', 'Number of family members to cover', true],
            ['ages_of_dependents', 'string', 'Ages of spouse and children', true],
            ['maternity_needs', 'boolean', 'Whether maternity coverage is needed', false],
            ['pediatric_needs', 'string', 'Specific pediatric care requirements', false],
            ['family_medical_history', 'string', 'Relevant family medical history', false],
            ['childcare_providers', 'string', 'Preferred pediatricians or hospitals', false]
          ];
        case 'medicare_senior_plans':
          return [...baseVars,
            ['age', 'integer', 'Age of primary beneficiary', true],
            ['current_medicare_status', 'string', 'Current Medicare enrollment status', true],
            ['prescription_needs', 'string', 'Current prescription medications', false],
            ['supplement_interest', 'boolean', 'Interest in supplemental coverage', false],
            ['retirement_status', 'string', 'Current retirement status', false],
            ['healthcare_frequency', 'string', 'How often you visit healthcare providers', false]
          ];
        case 'group_business_plans':
          return [...baseVars,
            ['business_size', 'integer', 'Number of employees', true],
            ['business_type', 'string', 'Type of business or industry', true],
            ['current_coverage', 'string', 'Current group coverage if any', false],
            ['budget_per_employee', 'string', 'Budget per employee per month', false],
            ['employee_demographics', 'string', 'General age range and family status', false],
            ['coverage_requirements', 'string', 'Specific coverage requirements', false]
          ];
        default:
          return baseVars;
      }
    }
    
    return baseVars;
  }
  
  private createDomainWebhookNode(webhook: any): string {
    const nodeId = `${this.domain.replace(/\s+/g, '_')}_${webhook.name.replace(/\s+/g, '_').toLowerCase()}_${++this.nodeCount}`;
    
    this.nodes.push({
      id: nodeId,
      type: 'Webhook',
      data: {
        name: `${this.capitalizeWords(this.domain)} ${webhook.name}`,
        type: 'Webhook',
        prompt: `Processing your ${this.domain} request through our ${webhook.name}...`,
        webhookUrl: webhook.url,
        webhookMethod: webhook.method || 'POST',
        webhookData: webhook.data || {}
      }
    });
    
    return nodeId;
  }
  
  private createDomainKnowledgeBaseNode(kb: any): string {
    const nodeId = `${this.domain.replace(/\s+/g, '_')}_${kb.name.replace(/\s+/g, '_').toLowerCase()}_${++this.nodeCount}`;
    
    this.nodes.push({
      id: nodeId,
      type: 'Knowledge Base',
      data: {
        name: `${this.capitalizeWords(this.domain)} ${kb.name}`,
        type: 'Knowledge Base',
        prompt: `Let me search our comprehensive ${this.domain} ${kb.name.toLowerCase()} for the best information to answer your question.`,
        kb: kb.content
      }
    });
    
    return nodeId;
  }
  
  private createDomainTransferNode(transfer: any): string {
    const nodeId = `${this.domain.replace(/\s+/g, '_')}_${transfer.name.replace(/\s+/g, '_').toLowerCase()}_${++this.nodeCount}`;
    
    this.nodes.push({
      id: nodeId,
      type: 'Transfer Node',
      data: {
        name: `${this.capitalizeWords(this.domain)} ${transfer.name}`,
        type: 'Transfer Node',
        prompt: `I'm connecting you with our ${this.domain} ${transfer.name.toLowerCase()} who can provide specialized assistance with your needs.`,
        transferNumber: transfer.number
      }
    });
    
    return nodeId;
  }
  
  private createDomainResolutionNode(): string {
    const nodeId = `${this.domain.replace(/\s+/g, '_')}_resolution_${++this.nodeCount}`;
    
    this.nodes.push({
      id: nodeId,
      type: 'Default',
      data: {
        name: `${this.capitalizeWords(this.domain)} Resolution & Satisfaction`,
        type: 'Default',
        prompt: `Great! Let me confirm that we've addressed all your ${this.domain} needs today.
                 Are you satisfied with the ${this.domain} information and assistance provided?
                 Do you have any other ${this.domain} questions or needs?`,
        extractVars: [
          [`${this.domain.replace(/\s+/g, '_')}_satisfaction`, 'string', `Satisfaction with ${this.domain} service`],
          [`additional_${this.domain.replace(/\s+/g, '_')}_needs`, 'boolean', `Additional ${this.domain} assistance needed`],
          ['next_steps', 'string', 'Next steps customer wants to take']
        ]
      }
    });
    
    return nodeId;
  }
  
  private createDomainCompletionNode(): string {
    const nodeId = `${this.domain.replace(/\s+/g, '_')}_completion_${++this.nodeCount}`;
    
    this.nodes.push({
      id: nodeId,
      type: 'End Call',
      data: {
        name: `${this.capitalizeWords(this.domain)} Service Complete`,
        type: 'End Call',
        prompt: `Thank you for choosing ${this.domain}! We're always here to help.
                 Your ticket number is {{ticket_number}} for reference. Have a great day!`
      }
    });
    
    return nodeId;
  }
  
  private createConditionalEdge(sourceId: string, targetId: string, condition: string, description: string): void {
    const edgeId = `${this.domain.replace(/\s+/g, '_')}_edge_${++this.edgeCount}`;
    
    this.edges.push({
      id: edgeId,
      source: sourceId,
      target: targetId,
      label: condition,
      data: {
        name: `${this.capitalizeWords(this.domain)}: ${condition}`,
        description: description
      }
    });
  }
  
  private capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }
}