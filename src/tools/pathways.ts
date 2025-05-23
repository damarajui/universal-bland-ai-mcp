import { z } from 'zod';
import { BlandAIClient } from '../utils/bland-client.js';

// MODULAR BUILDING BLOCKS - Match exact Bland AI docs
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
  
  // Fine-tuning Support (exact from docs)
  pathwayExamples?: Array<{ userInput: string; pathway: string }>;
  conditionExamples?: Array<{ userInput: string; conditionMet: boolean }>;
  dialogueExamples?: Array<{ scenario: string; expectedResponse: string }>;
  
  // Model Configuration (exact from docs)
  modelOptions?: {
    modelName?: string;
    interruptionThreshold?: number;
    temperature?: number;
  };
  
  // Variable Extraction (exact format from docs)
  extractVars?: Array<[string, string, string]>; // [varName, varType, varDescription]
  
  // Webhook Features (for Webhook nodes)
  webhookUrl?: string;
  webhookMethod?: string;
  webhookData?: any;
  webhookHeaders?: Array<{ key: string; value: string }>;
  
  // ADDED: Dynamic Data Integration (Real-time API calls during conversation)
  dynamic_data?: Array<{
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    query?: Record<string, any>;
    body?: any;
    cache?: boolean;
    response_data?: Array<{
      name: string;
      data: string; // JSONPath like "$.customer.tier"
      context?: string; // How to use the variable
    }>;
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
  }>;
  
  // ADDED: Advanced Voice Settings (Dynamic voice switching)
  voice_settings?: {
    voice_id?: string | number;
    speed?: number;
    interruption_threshold?: number;
    reduce_latency?: boolean;
    dynamic_voice_switching?: boolean;
  };
  
  // ADDED: Real-time Intelligence Features
  ai_features?: {
    sentiment_analysis?: boolean;
    emotion_detection?: boolean;
    language_detection?: boolean;
    cultural_adaptation?: boolean;
    real_time_coaching?: boolean;
    predictive_routing?: boolean;
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

// MODULAR FEATURE BUILDERS
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
  asWebhook(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' = 'POST'): this {
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
  asWaitForResponse(): this { this.nodeType = 'Wait for Response'; return this; }

  // Feature setters
  asStart(): this { this.nodeData.isStart = true; return this; }
  asGlobal(label: string): this {
    this.nodeData.isGlobal = true;
    this.nodeData.globalLabel = label;
    return this;
  }
  withStaticText(text: string): this { this.nodeData.text = text; return this; }
  withPrompt(prompt: string): this { this.nodeData.prompt = prompt; return this; }
  withCondition(condition: string): this { this.nodeData.condition = condition; return this; }
  
  withVariableExtraction(vars: Array<[string, string, string]>): this {
    this.nodeData.extractVars = vars;
    return this;
  }
  
  withWebhookData(data: any): this { this.nodeData.webhookData = data; return this; }
  withWebhookHeaders(headers: Array<{ key: string; value: string }>): this {
    this.nodeData.webhookHeaders = headers;
    return this;
  }

  withFineTuning(
    pathwayExamples?: Array<{ userInput: string; pathway: string }>,
    conditionExamples?: Array<{ userInput: string; conditionMet: boolean }>,
    dialogueExamples?: Array<{ scenario: string; expectedResponse: string }>
  ): this {
    if (pathwayExamples) this.nodeData.pathwayExamples = pathwayExamples;
    if (conditionExamples) this.nodeData.conditionExamples = conditionExamples;
    if (dialogueExamples) this.nodeData.dialogueExamples = dialogueExamples;
    return this;
  }

  withModelOptions(options: {
    modelName?: string;
    interruptionThreshold?: number;
    temperature?: number;
  }): this {
    this.nodeData.modelOptions = options;
    return this;
  }

  // ADDED: Advanced feature builders
  withDynamicData(dynamicData: Array<{
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    query?: Record<string, any>;
    body?: any;
    cache?: boolean;
    response_data?: Array<{
      name: string;
      data: string;
      context?: string;
    }>;
  }>): this {
    this.nodeData.dynamic_data = dynamicData;
    return this;
  }
  
  withCustomTools(tools: Array<{
    name: string;
    description: string;
    input_schema: any;
    speech?: string;
    response_data?: Array<{ name: string; data: string; }>;
  }>): this {
    this.nodeData.custom_tools = tools;
    return this;
  }
  
  withAdvancedVoice(settings: {
    voice_id?: string | number;
    speed?: number;
    interruption_threshold?: number;
    reduce_latency?: boolean;
    dynamic_voice_switching?: boolean;
  }): this {
    this.nodeData.voice_settings = settings;
    return this;
  }
  
  withAIFeatures(features: {
    sentiment_analysis?: boolean;
    emotion_detection?: boolean;
    language_detection?: boolean;
    cultural_adaptation?: boolean;
    real_time_coaching?: boolean;
    predictive_routing?: boolean;
  }): this {
    this.nodeData.ai_features = features;
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

export function createPathwayTools(blandClient: BlandAIClient) {
  return [
    {
      name: 'create_modular_pathway',
      description: 'Create ANY type of conversational pathway from natural language description using modular building blocks. This is the universal pathway creator that can handle any request.',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(20).max(5000).describe('Natural language description of what the pathway should do'),
        
        // Optional specific features
        webhook_integrations: z.array(z.object({
          name: z.string(),
          url: z.string(),
          method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('POST'),
          data: z.any().optional(),
          headers: z.record(z.string()).optional()
        })).optional(),
        
        knowledge_bases: z.array(z.object({
          name: z.string(),
          content: z.string(),
          trigger_phrases: z.array(z.string()).optional()
        })).optional(),
        
        transfer_numbers: z.array(z.object({
          name: z.string(),
          number: z.string(),
          conditions: z.array(z.string()).optional()
        })).optional(),
        
        variable_collection: z.array(z.object({
          variable_name: z.string(),
          variable_type: z.enum(['string', 'integer', 'boolean']),
          description: z.string(),
          required: z.boolean().default(true)
        })).optional(),
        
        conditions: z.array(z.object({
          condition_text: z.string(),
          description: z.string()
        })).optional(),
        
        global_features: z.object({
          help_node: z.boolean().default(true),
          fallback_handling: z.boolean().default(true),
          interruption_handling: z.boolean().default(true)
        }).optional(),
        
        advanced_features: z.object({
          fine_tuning: z.boolean().default(false),
          model_customization: z.boolean().default(false),
          dynamic_routing: z.boolean().default(true)
        }).optional()
      }),
      
      handler: async (args: any) => {
        try {
          // Create basic pathway first
          const basicPathway = await blandClient.createPathway(args.name, args.description);
          
          // Parse the natural language description
          const nodeTypes = PathwayComponentParser.parseNodeTypes(args.description);
          const features = PathwayComponentParser.parseFeatures(args.description);
          const workflowSteps = PathwayComponentParser.parseWorkflowSteps(args.description);
          
          // Build modular pathway
          const builder = new ModularPathwayBuilder();
          const nodeIds: string[] = [];
          
          // 1. Create start node
          const startNode = builder.createNode('Intelligent Start')
            .asDefault()
            .asStart()
            .withPrompt(`Welcome! I'll help you with ${args.name.toLowerCase()}. ${workflowSteps[0]?.stepPurpose || 'How can I assist you today?'}`)
            .withVariableExtraction([
              ['initial_intent', 'string', 'What the caller wants to accomplish'],
              ['caller_name', 'string', 'Caller name if provided'],
              ['urgency_level', 'string', 'How urgent their request is']
            ]);
          
          const startId = builder.addNode(startNode);
          nodeIds.push(startId);
          
          // 2. Create nodes for each workflow step
          for (let i = 1; i < workflowSteps.length - 1; i++) {
            const step = workflowSteps[i];
            let stepNode = builder.createNode(step.stepName)
              .asDefault()
              .withPrompt(`${step.stepPurpose}. Let me help you with this step.`);
            
            // Add features based on step type
            if (step.stepType === 'information_gathering' && features.needsVariableExtraction) {
              stepNode = stepNode.withVariableExtraction(features.variables.length > 0 ? features.variables : [
                ['collected_info', 'string', 'Information gathered in this step'],
                ['step_complete', 'boolean', 'Whether this step is complete']
              ]);
            }
            
            if (features.needsConditions) {
              stepNode = stepNode.withCondition(`Must complete ${step.stepType.replace('_', ' ')} before proceeding`);
            }
            
            const stepId = builder.addNode(stepNode);
            nodeIds.push(stepId);
          }
          
          // 3. Add webhook integrations
          if (args.webhook_integrations?.length > 0) {
            for (const webhook of args.webhook_integrations) {
              const webhookNode = builder.createNode(webhook.name)
                .asWebhook(webhook.url, webhook.method)
                .withPrompt(`Processing ${webhook.name}...`)
                .withWebhookData(webhook.data || {});
              
              if (webhook.headers) {
                webhookNode.withWebhookHeaders(
                  Object.entries(webhook.headers).map(([key, value]) => ({ key, value: String(value) }))
                );
              }
              
              const webhookId = builder.addNode(webhookNode);
              nodeIds.push(webhookId);
            }
          }
          
          // 4. Add knowledge base nodes
          if (args.knowledge_bases?.length > 0) {
            for (const kb of args.knowledge_bases) {
              const kbNode = builder.createNode(kb.name)
                .asKnowledgeBase(kb.content)
                .withPrompt(`Let me search our ${kb.name} for the best answer to your question.`);
              
              const kbId = builder.addNode(kbNode);
              nodeIds.push(kbId);
            }
          }
          
          // 5. Add transfer nodes
          if (args.transfer_numbers?.length > 0) {
            for (const transfer of args.transfer_numbers) {
              const transferNode = builder.createNode(transfer.name)
                .asTransfer(transfer.number)
                .withPrompt(`I'm transferring you to ${transfer.name} for specialized assistance.`);
              
              const transferId = builder.addNode(transferNode);
              nodeIds.push(transferId);
            }
          }
          
          // 6. Add global help node
          if (args.global_features?.help_node !== false) {
            const globalNode = builder.createNode('Universal Help')
              .asDefault()
              .asGlobal('user needs help or has questions')
              .withPrompt(`I'm here to help! What specific assistance do you need with ${args.name.toLowerCase()}? 
                         Previous context: {{prevNodePrompt}}`);
            
            builder.addNode(globalNode);
          }
          
          // 7. Create end node
          const endNode = builder.createNode('Completion')
            .asEndCall()
            .withPrompt(`Thank you for using ${args.name}! Everything has been completed successfully. Have a great day!`);
          
          const endId = builder.addNode(endNode);
          nodeIds.push(endId);
          
          // 8. Create intelligent edges
          for (let i = 0; i < nodeIds.length - 1; i++) {
            const sourceId = nodeIds[i];
            const targetId = nodeIds[i + 1];
            
            let label = 'ready to proceed';
            if (i === 0) label = 'initial intent understood';
            else if (i === nodeIds.length - 2) label = 'all tasks completed';
            else label = `step ${i} completed successfully`;
            
            builder.addEdge(sourceId, targetId, label, {
              name: `Step ${i + 1} to ${i + 2}`,
              description: `Progression from step ${i + 1} to step ${i + 2}`
            });
          }
          
          // Build final pathway
          const pathwayStructure = builder.build();
          
          // Update pathway with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            args.description,
            pathwayStructure.nodes,
            pathwayStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created modular pathway "${args.name}" with ${pathwayStructure.nodes.length} nodes and complete natural language understanding`,
            modular_analysis: {
              detected_node_types: nodeTypes,
              detected_features: features,
              workflow_steps: workflowSteps.length,
              webhook_integrations: args.webhook_integrations?.length || 0,
              knowledge_bases: args.knowledge_bases?.length || 0,
              transfer_numbers: args.transfer_numbers?.length || 0,
              total_nodes: pathwayStructure.nodes.length,
              total_edges: pathwayStructure.edges.length
            },
            pathway_capabilities: [
              'Natural language workflow parsing',
              'Modular component composition',
              'Intelligent feature detection',
              'Dynamic edge routing',
              'Complete Bland AI API compliance',
              'Unlimited customization potential'
            ]
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
      name: 'create_ultra_advanced_pathway',
      description: 'Create the most sophisticated pathway possible with dynamic data, custom tools, fine-tuning, and all advanced Bland AI features',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(10).max(5000),
        business_context: z.string().optional(),
        goal: z.string().optional(),
        
        // Advanced Integration Options
        crm_integration: z.object({
          api_url: z.string(),
          api_key: z.string(),
          lookup_endpoint: z.string().optional(),
          update_endpoint: z.string().optional()
        }).optional(),
        
        // Dynamic Data Sources (Real-time API calls during conversation)
        data_sources: z.array(z.object({
          name: z.string(),
          url: z.string(),
          method: z.enum(['GET', 'POST', 'PATCH', 'DELETE']).default('GET'),
          headers: z.record(z.string()).optional(),
          query: z.record(z.any()).optional(),
          body: z.any().optional(),
          cache: z.coerce.boolean().default(true),
          response_mapping: z.array(z.object({
            name: z.string(),
            data: z.string(),
            context_description: z.string()
          }))
        })).optional(),
        
        // Custom Tools (API integrations executable during calls)
        custom_tools: z.array(z.object({
          name: z.string(),
          description: z.string(),
          input_schema: z.object({
            type: z.literal('object'),
            properties: z.record(z.any()),
            required: z.array(z.string()).optional(),
            example: z.any().optional()
          }),
          speech: z.string().optional(), // What AI says while executing tool
          response_data: z.array(z.object({
            name: z.string(),           // FIXED: Match Bland docs
            data: z.string()            // FIXED: JSON path like "$.calls[0].c_id"
          }))
        })).optional(),
        
        // Fine-tuning Examples (Train the pathway behavior)
        training_examples: z.array(z.object({
          scenario: z.string(),
          user_input: z.string(),
          expected_node: z.string(),
          expected_response: z.string(),
          extracted_variables: z.record(z.string()).optional()
        })).optional(),
        
        // Knowledge Base Integration
        knowledge_bases: z.array(z.object({
          kb_id: z.string().optional(),
          content: z.string().optional(),
          search_mode: z.enum(['semantic', 'keyword', 'hybrid']).default('semantic'),
          confidence_threshold: z.number().optional()
        })).optional(),
        
        // Advanced Voice Settings
        voice_settings: z.object({
          voice_id: z.union([z.string(), z.coerce.number()]).optional(),
          speed: z.coerce.number().min(0.5).max(2.0).optional(),
          interruption_threshold: z.coerce.number().min(0).max(100).optional(),
          reduce_latency: z.coerce.boolean().default(true)
        }).optional(),
        
        // Call Configuration
        call_settings: z.object({
          max_duration: z.coerce.number().min(1).max(60).optional(),
          record: z.coerce.boolean().default(true),
          wait_for_greeting: z.coerce.boolean().default(true),
          language: z.string().default('ENG'),
          answered_by_enabled: z.coerce.boolean().default(true)
        }).optional(),
        
        // Transfer Configuration
        transfer_settings: z.object({
          primary_number: z.string().optional(),
          fallback_number: z.string().optional(),
          transfer_conditions: z.array(z.string()).optional()
        }).optional(),
        
        // Webhook Integration
        webhook_settings: z.object({
          url: z.string(),
          method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
          headers: z.record(z.string()).optional(),
          events: z.array(z.enum(['node_entry', 'variable_extraction', 'tool_execution', 'transfer', 'end_call'])).optional()
        }).optional()
      }),
      handler: async (args: any) => {
        try {
          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, args.description);
          
          // Build sophisticated structure using proven working pathway
          const advancedStructure = buildSophisticatedPathway(args);
          
          // Update with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            args.description,
            advancedStructure.nodes,
            advancedStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created ultra-advanced pathway "${args.name}" with every possible Bland AI feature`,
            advanced_features: {
              dynamic_data_sources: args.data_sources?.length || 0,
              custom_tools: args.custom_tools?.length || 0,
              training_examples: args.training_examples?.length || 0,
              knowledge_bases: args.knowledge_bases?.length || 0,
              crm_integration: !!args.crm_integration,
              voice_customization: !!args.voice_settings,
              call_optimization: !!args.call_settings,
              webhook_integration: !!args.webhook_settings,
              transfer_logic: !!args.transfer_settings,
              nodes_created: advancedStructure.nodes.length,
              edges_created: advancedStructure.edges.length
            },
            capabilities: [
              'Real-time CRM data lookup and updates',
              'Dynamic external API integration during calls',
              'Custom tool execution with response mapping',
              'Fine-tuned conversation routing with examples',
              'Advanced voice and call control',
              'Multi-condition branching logic',
              'Context-aware variable extraction',
              'Intelligent fallback handling',
              'Knowledge base semantic search',
              'Webhook events at every stage',
              'Complex transfer routing logic',
              'Real-time data injection'
            ]
          };
        } catch (error: any) {
          console.error('Error creating ultra-advanced pathway:', error);
          return {
            success: false,
            error: error.message,
            message: `Failed to create ultra-advanced pathway "${args.name}"`
          };
        }
      }
    },

    {
      name: 'create_sophisticated_pathway_from_description',
      description: 'Create a complete, sophisticated conversational pathway with full node structure and routing logic from natural language description',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(10).max(5000),
        business_context: z.string().optional(),
        goal: z.string().optional(),
        transfer_number: z.string().optional(),
        webhook_url: z.string().optional(),
        knowledge_base_content: z.string().optional(),
        use_advanced_features: z.coerce.boolean().default(true)
      }),
      handler: async (args: any) => {
        try {
          // First create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, args.description);
          
          // Then build sophisticated structure
          const sophisticatedStructure = buildSophisticatedPathway(args);
          
          // Update pathway with complete structure
          const result = await blandClient.updatePathway(
            basicPathway.pathway_id,
            args.name,
            args.description,
            sophisticatedStructure.nodes,
            sophisticatedStructure.edges
          );
          
          return {
            success: true,
            pathway_id: basicPathway.pathway_id,
            message: `Created sophisticated pathway "${args.name}" with ${sophisticatedStructure.nodes.length} nodes and complete conversation flow logic`,
            pathway_details: {
              nodes_created: sophisticatedStructure.nodes.length,
              edges_created: sophisticatedStructure.edges.length,
              has_conditions: sophisticatedStructure.nodes.some(n => n.data.condition),
              has_variable_extraction: sophisticatedStructure.nodes.some(n => n.data.extractVars),
              has_webhooks: sophisticatedStructure.nodes.some(n => n.type === 'Webhook'),
              has_global_nodes: sophisticatedStructure.nodes.some(n => n.data.isGlobal),
              fully_automated: true
            }
          };
        } catch (error: any) {
          console.error('Error creating sophisticated pathway:', error);
          return {
            success: false,
            error: error.message,
            message: `Failed to create sophisticated pathway "${args.name}"`
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
        objection_handling: z.coerce.boolean().default(true),
        transfer_number: z.string().optional(),
        webhook_url: z.string().optional(),
        lead_scoring: z.coerce.boolean().default(true)
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
        service_types: z.array(z.string()).default(['billing', 'technical', 'general', 'account']),
        knowledge_base_content: z.string().optional(),
        escalation_number: z.string().optional(),
        resolution_webhook: z.string().optional(),
        satisfaction_tracking: z.coerce.boolean().default(true)
      }),
      handler: async (args: any) => {
        try {
          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, `Advanced AI customer service for ${args.company_name}`);
          
          // Build customer service structure
          const serviceStructure = buildAdvancedCustomerServicePathway(args);
          
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
        service_types: z.array(z.string()),
        business_hours: z.string().default('9 AM to 5 PM, Monday to Friday'),
        booking_webhook: z.string().optional(),
        confirmation_method: z.enum(['email', 'sms', 'both']).default('both'),
        automated_reminders: z.coerce.boolean().default(true),
        rescheduling_allowed: z.coerce.boolean().default(true)
      }),
      handler: async (args: any) => {
        try {
          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, `Intelligent appointment system for ${args.business_name}`);
          
          // Build appointment system structure
          const appointmentStructure = buildIntelligentAppointmentSystem(args);
          
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
        required_data_points: z.array(z.string()).optional(),
        decision_points: z.array(z.string()).optional(),
        integrations: z.array(z.object({
          type: z.enum(['webhook', 'knowledge_base', 'transfer']),
          description: z.string(),
          endpoint: z.string().optional()
        })).optional(),
        advanced_features: z.object({
          variable_extraction: z.coerce.boolean().default(true),
          conditional_logic: z.coerce.boolean().default(true),
          global_fallbacks: z.coerce.boolean().default(true),
          fine_tuning_examples: z.coerce.boolean().default(false)
        }).optional()
      }),
      handler: async (args: any) => {
        try {
          // Create basic pathway
          const basicPathway = await blandClient.createPathway(args.name, args.workflow_description);
          
          // Build custom workflow structure
          const customStructure = buildCustomWorkflowPathway(args);
          
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
              integrations_configured: args.integrations?.length || 0,
              data_points_tracked: args.required_data_points?.length || 0,
              decision_points: args.decision_points?.length || 0,
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

// Sophisticated pathway building functions
function buildSophisticatedPathway(args: any): CompletePathway {
  const nodes: PathwayNode[] = [];
  const edges: PathwayEdge[] = [];
  
  // Start Node - FIXED: Match exact docs structure
  nodes.push({
    id: 'start_node',
    type: 'Default',
    data: {
      name: 'Intelligent Greeting',
      type: 'Default',  // FIXED: Add type to data object per docs
      isStart: true,
      prompt: `You are an AI assistant for ${args.business_context || 'this business'}. 
               Greet the caller warmly and ask how you can help them today. 
               Listen carefully to determine their needs and respond appropriately.
               Goal: ${args.goal || 'Provide excellent assistance'}`,
      condition: 'You must understand what the caller needs before proceeding',
      extractVars: [
        ['caller_intent', 'string', 'The primary reason for the call'],
        ['caller_urgency', 'string', 'How urgent their request seems (low/medium/high)'],
        ['caller_name', 'string', 'The caller\'s name if provided']
      ]
    }
  });

  // Information Gathering Node - FIXED: Add data.type
  nodes.push({
    id: 'info_gathering',
    type: 'Default',
    data: {
      name: 'Information Gathering',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `Based on the caller's intent: {{caller_intent}}, gather all necessary information.
               Ask relevant questions to fully understand their needs.
               Be thorough but efficient, especially if urgency is {{caller_urgency}}.`,
      condition: 'You must collect all relevant information before proceeding to resolution',
      extractVars: [
        ['key_details', 'string', 'Important details about their request'],
        ['contact_info', 'string', 'Contact information if needed'],
        ['resolution_type', 'string', 'Type of resolution needed']
      ]
    }
  });

  // Decision Hub Node - FIXED: Add data.type
  nodes.push({
    id: 'decision_hub',
    type: 'Default',
    data: {
      name: 'Decision Hub',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `Based on the information gathered, determine the best course of action.
               Consider: caller intent ({{caller_intent}}), urgency ({{caller_urgency}}), 
               and details ({{key_details}}).
               Provide clear next steps or solutions.`,
      extractVars: [
        ['decision_outcome', 'string', 'The decision made for this case'],
        ['followup_needed', 'boolean', 'Whether follow-up is required']
      ]
    }
  });

  // Webhook Integration Node (if provided) - FIXED: Proper webhook structure
  if (args.webhook_url) {
    nodes.push({
      id: 'webhook_integration',
      type: 'Webhook',
      data: {
        name: 'System Integration',
        type: 'Webhook',  // FIXED: Add type to data object per docs
        prompt: 'Processing your request in our system...',
        webhookUrl: args.webhook_url,
        webhookMethod: 'POST',
        webhookData: {
          caller_intent: '{{caller_intent}}',
          caller_name: '{{caller_name}}',
          key_details: '{{key_details}}',
          resolution_type: '{{resolution_type}}',
          decision_outcome: '{{decision_outcome}}'
        }
      }
    });
  }

  // Global Help Node - FIXED: Proper global node structure
  nodes.push({
    id: 'global_help',
    type: 'Default',
    data: {
      name: 'General Help',
      type: 'Default',  // FIXED: Add type to data object per docs
      isGlobal: true,
      globalLabel: 'user needs general help or has questions',
      prompt: `Answer the user's question helpfully. Previous context: {{prevNodePrompt}}
               After answering, guide them back to the main process if appropriate.
               Use this format: Answer their question, then ask "Shall we continue with your original request?"`
    }
  });

  // Transfer Node (if provided) - FIXED: Use Transfer Node type
  if (args.transfer_number) {
    nodes.push({
      id: 'transfer_to_human',
      type: 'Transfer Node',
      data: {
        name: 'Transfer to Specialist',
        type: 'Transfer Node',  // FIXED: Add type to data object per docs
        prompt: `I'm transferring you to a specialist who can better assist you with {{caller_intent}}.
                 Please hold while I connect you.`,
        transferNumber: args.transfer_number
      }
    });
  }

  // Resolution Node - FIXED: Add data.type
  nodes.push({
    id: 'resolution',
    type: 'Default',
    data: {
      name: 'Resolution & Wrap-up',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `Summarize what was accomplished: {{decision_outcome}}.
               Confirm if the caller is satisfied with the resolution.
               Provide any necessary follow-up information.`,
      condition: 'Ensure caller satisfaction before ending',
      extractVars: [
        ['satisfaction_level', 'string', 'How satisfied the caller seems (very/somewhat/not satisfied)'],
        ['additional_needs', 'boolean', 'Whether they have additional needs']
      ]
    }
  });

  // End Call Node - FIXED: Proper end call structure
  nodes.push({
    id: 'end_call',
    type: 'End Call',
    data: {
      name: 'End Call',
      type: 'End Call',  // FIXED: Add type to data object per docs
      prompt: `Thank you for calling ${args.business_context || 'us'}, {{caller_name}}! 
               Have a great day and don't hesitate to call if you need anything else.`
    }
  });

  // Create edges (pathways between nodes) - FIXED: Enhanced edge structure
  edges.push(
    { 
      id: 'edge_1', 
      source: 'start_node', 
      target: 'info_gathering', 
      label: 'caller intent understood',
      data: { name: 'Intent Understood', description: 'Customer intent has been identified' }
    },
    { 
      id: 'edge_2', 
      source: 'info_gathering', 
      target: 'decision_hub', 
      label: 'sufficient information gathered',
      data: { name: 'Information Complete', description: 'All necessary information collected' }
    },
    { 
      id: 'edge_3', 
      source: 'decision_hub', 
      target: args.webhook_url ? 'webhook_integration' : 'resolution', 
      label: 'standard resolution path',
      data: { name: 'Standard Path', description: 'Following normal resolution process' }
    }
  );

  if (args.webhook_url) {
    edges.push({ 
      id: 'edge_4', 
      source: 'webhook_integration', 
      target: 'resolution', 
      label: 'system processing complete',
      data: { name: 'Processing Complete', description: 'System integration finished' }
    });
  }

  if (args.transfer_number) {
    edges.push(
      { 
        id: 'edge_5', 
        source: 'decision_hub', 
        target: 'transfer_to_human', 
        label: 'requires human specialist',
        data: { name: 'Complex Case', description: 'Issue requires human intervention' }
      },
      { 
        id: 'edge_6', 
        source: 'info_gathering', 
        target: 'transfer_to_human', 
        label: 'complex issue requiring immediate transfer',
        data: { name: 'Immediate Transfer', description: 'Urgent issue needs immediate escalation' }
      }
    );
  }

  edges.push(
    { 
      id: 'edge_7', 
      source: 'resolution', 
      target: 'end_call', 
      label: 'caller satisfied and no additional needs',
      data: { name: 'Resolution Complete', description: 'Customer satisfied, call can end' }
    },
    { 
      id: 'edge_8', 
      source: 'resolution', 
      target: 'info_gathering', 
      label: 'additional needs identified',
      data: { name: 'Additional Needs', description: 'Customer has more requests' }
    }
  );

  return { name: args.name, description: args.description, nodes, edges };
}

function buildEnterpriseSalesPathway(args: any): CompletePathway {
  const nodes: PathwayNode[] = [];
  const edges: PathwayEdge[] = [];

  // Greeting & Qualification Start - FIXED: Proper node structure
  nodes.push({
    id: 'sales_greeting',
    type: 'Default',
    data: {
      name: 'Professional Sales Greeting',
      type: 'Default',  // FIXED: Add type to data object per docs
      isStart: true,
      prompt: `Hello! This is a call from ${args.company_name} regarding ${args.product_or_service}. 
               I'd like to discuss how we can help your business. Do you have a few minutes to talk?`,
      condition: 'Must confirm they have time and interest before proceeding',
      extractVars: [
        ['availability', 'string', 'Whether they have time now (yes/no/schedule)'],
        ['initial_interest', 'string', 'Level of initial interest (high/medium/low/none)']
      ]
    }
  });

  // BANT Qualification Node - FIXED: Add data.type
  nodes.push({
    id: 'bant_qualification',
    type: 'Default',
    data: {
      name: 'BANT Qualification Process',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `I'd like to understand your current situation to see if ${args.product_or_service} is a good fit.
               Let me ask a few questions about your ${args.qualification_criteria}.
               This will help me provide the most relevant information.`,
      condition: 'Must gather Budget, Authority, Need, and Timeline information',
      extractVars: [
        ['budget_range', 'string', 'Their budget range or constraints'],
        ['decision_authority', 'string', 'Who makes the final decision'],
        ['business_need', 'string', 'Specific pain points or needs'],
        ['timeline', 'string', 'When they need to implement'],
        ['current_solution', 'string', 'What they use currently']
      ]
    }
  });

  // Needs Assessment & Demo - FIXED: Add data.type
  nodes.push({
    id: 'needs_demo',
    type: 'Default',
    data: {
      name: 'Needs Assessment & Value Demonstration',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `Based on your needs for {{business_need}} and timeline of {{timeline}}, 
               let me explain how ${args.product_or_service} specifically addresses these challenges.
               [Customize presentation based on their specific situation]`,
      extractVars: [
        ['pain_severity', 'string', 'How severe their current pain points are'],
        ['value_understanding', 'string', 'How well they understand the value proposition'],
        ['questions_concerns', 'string', 'Any questions or concerns raised']
      ]
    }
  });

  // Price Presentation - FIXED: Add data.type
  if (args.price_range) {
    nodes.push({
      id: 'pricing_presentation',
      type: 'Default',
      data: {
        name: 'Investment Discussion',
        type: 'Default',  // FIXED: Add type to data object per docs
        prompt: `Given your budget considerations of {{budget_range}} and the value we've discussed,
                 the investment for ${args.product_or_service} is ${args.price_range}.
                 This represents significant ROI based on your {{business_need}}.`,
        extractVars: [
          ['price_reaction', 'string', 'Their reaction to pricing (positive/neutral/concerned/shocked)'],
          ['budget_fit', 'string', 'How well it fits their budget (perfect/tight/over/way_over)']
        ]
      }
    });
  }

  // Objection Handling (Global Node) - FIXED: Proper global structure
  nodes.push({
    id: 'objection_handling',
    type: 'Default',
    data: {
      name: 'Objection Resolution',
      type: 'Default',  // FIXED: Add type to data object per docs
      isGlobal: true,
      globalLabel: 'customer has objections or concerns',
      prompt: `I understand your concern about {{lastUserMessage}}. Let me address that directly.
               [Handle objection based on type: price, features, timing, authority, competition]
               After addressing: "Does that help clarify things? What other questions do you have?"
               Previous goal: {{prevNodePrompt}}`
    }
  });

  // Lead Scoring & Routing - FIXED: Add data.type
  nodes.push({
    id: 'lead_scoring',
    type: 'Default',
    data: {
      name: 'Qualification Assessment',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `Based on our conversation, let me confirm the next steps that make sense for you.
               Given your {{business_need}} and {{timeline}}, I want to ensure you get the right support.`,
      extractVars: [
        ['lead_score', 'integer', 'Lead score 1-10 based on BANT qualification'],
        ['next_step_preference', 'string', 'What next step they prefer'],
        ['urgency_level', 'string', 'How urgent their need is']
      ]
    }
  });

  // CRM Integration Webhook - FIXED: Proper webhook structure
  if (args.webhook_url) {
    nodes.push({
      id: 'crm_integration',
      type: 'Webhook',
      data: {
        name: 'Lead Processing',
        type: 'Webhook',  // FIXED: Add type to data object per docs
        prompt: 'Let me update our system with your information...',
        webhookUrl: args.webhook_url,
        webhookMethod: 'POST',
        webhookData: {
          company: args.company_name,
          lead_score: '{{lead_score}}',
          budget_range: '{{budget_range}}',
          decision_authority: '{{decision_authority}}',
          business_need: '{{business_need}}',
          timeline: '{{timeline}}',
          price_reaction: '{{price_reaction}}',
          next_step: '{{next_step_preference}}'
        }
      }
    });
  }

  // High-Value Transfer - FIXED: Use Transfer Node type
  if (args.transfer_number) {
    nodes.push({
      id: 'sales_transfer',
      type: 'Transfer Node',
      data: {
        name: 'Transfer to Senior Sales',
        type: 'Transfer Node',  // FIXED: Add type to data object per docs
        prompt: `Based on your strong interest and {{timeline}} timeline, I'm connecting you 
                 with our senior sales specialist who can finalize the details and get you started.`,
        transferNumber: args.transfer_number
      }
    });
  }

  // Follow-up Scheduling - FIXED: Add data.type
  nodes.push({
    id: 'followup_scheduling',
    type: 'Default',
    data: {
      name: 'Next Steps & Follow-up',
      type: 'Default',  // FIXED: Add type to data object per docs
      prompt: `I'll schedule a follow-up for {{timeline}} to check on your decision process.
               In the meantime, I'll send you information about {{business_need}} solutions.
               What's the best way to reach you?`,
      extractVars: [
        ['followup_date', 'string', 'When to follow up'],
        ['preferred_contact', 'string', 'How they prefer to be contacted'],
        ['decision_timeline', 'string', 'When they plan to make a decision']
      ]
    }
  });

  // End Call - FIXED: Proper end call structure
  nodes.push({
    id: 'sales_end',
    type: 'End Call',
    data: {
      name: 'Professional Closing',
      type: 'End Call',  // FIXED: Add type to data object per docs
      prompt: `Thank you for your time today. I'm confident ${args.product_or_service} can help with {{business_need}}.
               I'll follow up as scheduled, and please feel free to call with any questions.`
    }
  });

  // Create sophisticated routing edges - FIXED: Enhanced edge structure
  edges.push(
    { 
      id: 'se_1', 
      source: 'sales_greeting', 
      target: 'bant_qualification', 
      label: 'interested and has time',
      data: { name: 'Engaged Prospect', description: 'Customer is interested and available' }
    },
    { 
      id: 'se_2', 
      source: 'bant_qualification', 
      target: 'needs_demo', 
      label: 'qualified prospect with clear need',
      data: { name: 'Qualified Lead', description: 'BANT qualification shows fit' }
    },
    { 
      id: 'se_3', 
      source: 'needs_demo', 
      target: args.price_range ? 'pricing_presentation' : 'lead_scoring', 
      label: 'understands value proposition',
      data: { name: 'Value Demonstrated', description: 'Customer sees value in solution' }
    }
  );

  if (args.price_range) {
    edges.push({ 
      id: 'se_4', 
      source: 'pricing_presentation', 
      target: 'lead_scoring', 
      label: 'pricing discussion complete',
      data: { name: 'Pricing Presented', description: 'Investment discussion finished' }
    });
  }

  edges.push(
    { 
      id: 'se_5', 
      source: 'lead_scoring', 
      target: args.webhook_url ? 'crm_integration' : (args.transfer_number ? 'sales_transfer' : 'followup_scheduling'), 
      label: 'high-value lead (score 8+)',
      data: { name: 'Hot Lead', description: 'High-value prospect ready to buy' }
    },
    { 
      id: 'se_6', 
      source: 'lead_scoring', 
      target: 'followup_scheduling', 
      label: 'qualified but needs nurturing (score 5-7)',
      data: { name: 'Warm Lead', description: 'Qualified but needs follow-up' }
    }
  );

  if (args.webhook_url) {
    edges.push({ 
      id: 'se_7', 
      source: 'crm_integration', 
      target: args.transfer_number ? 'sales_transfer' : 'followup_scheduling', 
      label: 'lead processed',
      data: { name: 'CRM Updated', description: 'Lead information saved to CRM' }
    });
  }

  edges.push(
    { 
      id: 'se_8', 
      source: 'followup_scheduling', 
      target: 'sales_end', 
      label: 'follow-up scheduled',
      data: { name: 'Follow-up Set', description: 'Next contact scheduled' }
    },
    { 
      id: 'se_9', 
      source: 'sales_greeting', 
      target: 'followup_scheduling', 
      label: 'not available now but interested',
      data: { name: 'Schedule Later', description: 'Customer interested but busy' }
    }
  );

  return { name: args.name, description: `Enterprise sales pathway for ${args.company_name}`, nodes, edges };
}

function buildAdvancedCustomerServicePathway(args: any): CompletePathway {
  const nodes: PathwayNode[] = [];
  const edges: PathwayEdge[] = [];

  // Intelligent Greeting & Authentication
  nodes.push({
    id: 'service_greeting',
    type: 'Default',
    data: {
      name: 'Customer Service Greeting',
      isStart: true,
      prompt: `Hello! Welcome to ${args.company_name} customer service. I'm here to help you today.
               To better assist you, may I have your account number, email, or phone number on file?`,
      extractVars: [
        ['customer_identifier', 'string', 'Account number, email, or phone number'],
        ['issue_category', 'string', 'Initial categorization of their issue'],
        ['customer_tone', 'string', 'Customer emotional state (calm/frustrated/angry/urgent)']
      ]
    }
  });

  // Issue Classification & Triage
  nodes.push({
    id: 'issue_triage',
    type: 'Default',
    data: {
      name: 'Issue Classification',
      prompt: `Thank you. I see you're calling about {{issue_category}}. 
               Let me get the specific details so I can route you to the best solution.
               Can you describe the issue you're experiencing?`,
      condition: 'Must clearly understand and categorize the issue before proceeding',
      extractVars: [
        ['issue_type', 'string', 'Specific type: billing, technical, account, product'],
        ['issue_severity', 'string', 'Severity level: low, medium, high, critical'],
        ['issue_description', 'string', 'Detailed description of the problem']
      ]
    }
  });

  // Knowledge Base Resolution
  if (args.knowledge_base_content) {
    nodes.push({
      id: 'kb_resolution',
      type: 'Knowledge Base',
      data: {
        name: 'Knowledge Base Resolution',
        kb: args.knowledge_base_content,
        prompt: `I'll help you resolve this {{issue_type}} issue: {{issue_description}}.
                 Let me check our knowledge base for the best solution.`,
        condition: 'Must attempt knowledge base resolution before escalation',
        extractVars: [
          ['kb_solution_found', 'boolean', 'Whether KB provided a viable solution'],
          ['customer_satisfaction', 'string', 'Customer satisfaction with KB solution']
        ]
      }
    });
  }

  // End Call
  nodes.push({
    id: 'service_end',
    type: 'End Call',
    data: {
      name: 'Service Completion',
      prompt: `Thank you for contacting ${args.company_name}. Your {{issue_type}} issue has been 
               addressed. If you need any further assistance, please don't hesitate to call back.`
    }
  });

  // Create intelligent routing edges
  edges.push(
    { id: 'cs_1', source: 'service_greeting', target: 'issue_triage', label: 'customer authenticated' },
    { id: 'cs_2', source: 'issue_triage', target: args.knowledge_base_content ? 'kb_resolution' : 'service_end', label: 'issue categorized' }
  );

  if (args.knowledge_base_content) {
    edges.push({ id: 'cs_3', source: 'kb_resolution', target: 'service_end', label: 'resolution attempted' });
  }

  return { name: args.name, description: `Advanced customer service for ${args.company_name}`, nodes, edges };
}

function buildIntelligentAppointmentSystem(args: any): CompletePathway {
  const nodes: PathwayNode[] = [];
  const edges: PathwayEdge[] = [];

  // Appointment System Greeting
  nodes.push({
    id: 'appointment_greeting',
    type: 'Default',
    data: {
      name: 'Appointment Booking Greeting',
      isStart: true,
      prompt: `Hello! Thank you for calling ${args.business_name} appointment booking.
               I can help you schedule an appointment for our ${args.service_types.join(', ')} services.
               Are you a new or existing customer?`,
      extractVars: [
        ['customer_type', 'string', 'new or existing customer'],
        ['preferred_service', 'string', 'Which service they\'re interested in'],
        ['urgency', 'string', 'How soon they need the appointment']
      ]
    }
  });

  // Customer Information Collection
  nodes.push({
    id: 'customer_info',
    type: 'Default',
    data: {
      name: 'Customer Information',
      prompt: `I'll need some information to schedule your {{preferred_service}} appointment.
               Can you provide your name, phone number, and email address?`,
      condition: 'Must collect complete contact information',
      extractVars: [
        ['customer_name', 'string', 'Full name'],
        ['phone_number', 'string', 'Contact phone number'],
        ['email_address', 'string', 'Email address'],
        ['previous_customer', 'boolean', 'Whether they\'ve been here before']
      ]
    }
  });

  // Service Selection & Details
  nodes.push({
    id: 'service_selection',
    type: 'Default',
    data: {
      name: 'Service Selection',
      prompt: `Great! For your {{preferred_service}} appointment, let me get some details.
                               ${args.service_types.map((service: string) => `${service} service`).join(', ')} are available.
               Which specific service would you like, and any special requirements?`,
      extractVars: [
        ['selected_service', 'string', 'Specific service selected'],
        ['service_duration', 'string', 'Expected duration needed'],
        ['special_requests', 'string', 'Any special requirements or notes']
      ]
    }
  });

  // Availability Checking (with webhook if provided)
  nodes.push({
    id: 'availability_check',
    type: args.booking_webhook ? 'Webhook' : 'Default',
    data: {
      name: 'Availability Check',
      prompt: args.booking_webhook 
        ? 'Let me check our real-time availability for {{selected_service}}...'
        : `Our ${args.business_hours} availability for {{selected_service}}. 
           What days and times work best for you?`,
      ...(args.booking_webhook && {
        webhookUrl: args.booking_webhook,
        webhookMethod: 'GET',
        webhookData: {
          service: '{{selected_service}}',
          duration: '{{service_duration}}',
          customer_preference: '{{preferred_time}}'
        }
      }),
      extractVars: [
        ['available_slots', 'string', 'Available time slots'],
        ['preferred_date', 'string', 'Customer preferred date'],
        ['preferred_time', 'string', 'Customer preferred time'],
        ['booking_possible', 'boolean', 'Whether booking can be made']
      ]
    }
  });

  // Appointment Confirmation
  nodes.push({
    id: 'appointment_confirmation',
    type: 'Default',
    data: {
      name: 'Appointment Confirmation',
      prompt: `Perfect! I can confirm your {{selected_service}} appointment for {{preferred_date}} at {{preferred_time}}.
               The appointment is for {{customer_name}} at ${args.business_name}.
               Shall I confirm this booking?`,
      condition: 'Must get explicit confirmation before finalizing',
      extractVars: [
        ['final_confirmation', 'boolean', 'Customer confirms the appointment'],
        ['payment_method', 'string', 'How they want to handle payment'],
        ['reminder_preference', 'string', 'How they want appointment reminders']
      ]
    }
  });

  // Booking Finalization (with webhook)
  if (args.booking_webhook) {
    nodes.push({
      id: 'booking_finalization',
      type: 'Webhook',
      data: {
        name: 'Appointment Booking',
        prompt: 'Finalizing your appointment booking...',
        webhookUrl: args.booking_webhook,
        webhookMethod: 'POST',
        webhookData: {
          customer_name: '{{customer_name}}',
          phone: '{{phone_number}}',
          email: '{{email_address}}',
          service: '{{selected_service}}',
          date: '{{preferred_date}}',
          time: '{{preferred_time}}',
          special_requests: '{{special_requests}}',
          confirmation_method: args.confirmation_method
        }
      }
    });
  }

  // Confirmation Details & Instructions
  nodes.push({
    id: 'confirmation_details',
    type: 'Default',
    data: {
      name: 'Booking Confirmation',
      prompt: `Your appointment is confirmed! Here are the details:
               Service: {{selected_service}}
               Date & Time: {{preferred_date}} at {{preferred_time}}
               Location: ${args.business_name}
               
               You'll receive ${args.confirmation_method} confirmation shortly.
               ${args.automated_reminders ? 'We\'ll also send you reminders before your appointment.' : ''}`,
      extractVars: [
        ['confirmation_sent', 'boolean', 'Confirmation sent successfully'],
        ['needs_directions', 'boolean', 'Whether they need directions'],
        ['has_questions', 'boolean', 'Whether they have additional questions']
      ]
    }
  });

  // Global Rescheduling Node (if allowed)
  if (args.rescheduling_allowed) {
    nodes.push({
      id: 'rescheduling_help',
      type: 'Default',
      data: {
        name: 'Rescheduling Assistance',
        isGlobal: true,
        globalLabel: 'customer wants to reschedule or cancel',
        prompt: `I can help you reschedule or cancel your appointment.
                 Let me look up your current booking and see what options are available.
                 What would you like to do with your appointment?`,
        extractVars: [
          ['reschedule_action', 'string', 'What they want to do (reschedule/cancel/modify)'],
          ['new_preferences', 'string', 'New date/time preferences if rescheduling']
        ]
      }
    });
  }

  // Business Information Global Node
  nodes.push({
    id: 'business_info',
    type: 'Default',
    data: {
      name: 'Business Information',
      isGlobal: true,
      globalLabel: 'customer asks about hours, location, services, or pricing',
      prompt: `I'm happy to provide information about ${args.business_name}.
               Our hours are ${args.business_hours}. We offer ${args.service_types.join(', ')}.
               What specific information do you need?`,
      extractVars: [
        ['info_provided', 'string', 'What information was requested and provided']
      ]
    }
  });

  // End Call
  nodes.push({
    id: 'appointment_end',
    type: 'End Call',
    data: {
      name: 'Appointment Booking Complete',
      prompt: `Thank you for booking with ${args.business_name}, {{customer_name}}!
               We look forward to seeing you on {{preferred_date}} at {{preferred_time}}.
               Have a great day!`
    }
  });

  // Create appointment flow edges
  edges.push(
    { id: 'ap_1', source: 'appointment_greeting', target: 'customer_info', label: 'wants to book appointment' },
    { id: 'ap_2', source: 'customer_info', target: 'service_selection', label: 'contact information collected' },
    { id: 'ap_3', source: 'service_selection', target: 'availability_check', label: 'service selected' },
    { id: 'ap_4', source: 'availability_check', target: 'appointment_confirmation', label: 'availability found' },
    { id: 'ap_5', source: 'appointment_confirmation', target: args.booking_webhook ? 'booking_finalization' : 'confirmation_details', label: 'appointment confirmed' }
  );

  if (args.booking_webhook) {
    edges.push({ id: 'ap_6', source: 'booking_finalization', target: 'confirmation_details', label: 'booking processed' });
  }

  edges.push(
    { id: 'ap_7', source: 'confirmation_details', target: 'appointment_end', label: 'all details provided' },
    { id: 'ap_8', source: 'availability_check', target: 'customer_info', label: 'no availability, need different preferences' }
  );

  return { name: args.name, description: `Intelligent appointment system for ${args.business_name}`, nodes, edges };
}

function buildCustomWorkflowPathway(args: any): CompletePathway {
  const nodes: PathwayNode[] = [];
  const edges: PathwayEdge[] = [];

  // Dynamic workflow builder based on description
  // This is a sophisticated AI-powered pathway generator
  
  // Start with greeting
  nodes.push({
    id: 'workflow_start',
    type: 'Default',
    data: {
      name: 'Workflow Initialization',
      isStart: true,
      prompt: `Welcome! I'll guide you through our ${args.name} process.
               ${args.workflow_description.split('.')[0]}.
               Let's get started!`,
      extractVars: [
        ['user_ready', 'boolean', 'Whether user is ready to proceed'],
        ['initial_context', 'string', 'Initial context or information provided']
      ]
    }
  });

  // Create data collection nodes for each required data point
  if (args.required_data_points) {
    for (let i = 0; i < args.required_data_points.length; i++) {
      const dataPoint = args.required_data_points[i];
      nodes.push({
        id: `data_${i}`,
        type: 'Default',
        data: {
          name: `Collect ${dataPoint}`,
          prompt: `I need to collect information about ${dataPoint}. 
                   Please provide the relevant details.`,
          condition: `Must collect complete information about ${dataPoint}`,
          extractVars: [
            [`${dataPoint.toLowerCase().replace(/\s+/g, '_')}`, 'string', `Information about ${dataPoint}`],
            [`${dataPoint.toLowerCase().replace(/\s+/g, '_')}_complete`, 'boolean', `Whether ${dataPoint} collection is complete`]
          ]
        }
      });
    }
  }

  // Create decision nodes for each decision point
  if (args.decision_points) {
    for (let i = 0; i < args.decision_points.length; i++) {
      const decisionPoint = args.decision_points[i];
      nodes.push({
        id: `decision_${i}`,
        type: 'Default',
        data: {
          name: `Decision: ${decisionPoint}`,
          prompt: `Based on the information collected, we need to make a decision about ${decisionPoint}.
                   Let me analyze the situation and determine the best path forward.`,
          extractVars: [
            [`decision_${i}_outcome`, 'string', `Decision made for ${decisionPoint}`],
            [`decision_${i}_confidence`, 'string', `Confidence level in this decision`]
          ]
        }
      });
    }
  }

  // Create integration nodes
  if (args.integrations) {
    for (let i = 0; i < args.integrations.length; i++) {
      const integration = args.integrations[i];
      
      if (integration.type === 'webhook') {
        nodes.push({
          id: `integration_${i}`,
          type: 'Webhook',
          data: {
            name: `${integration.description}`,
            prompt: `Processing ${integration.description}...`,
            webhookUrl: integration.endpoint || '',
            webhookMethod: 'POST',
            webhookData: {
              workflow_name: args.name,
              integration_type: integration.type,
              description: integration.description
            }
          }
        });
      } else if (integration.type === 'knowledge_base') {
        nodes.push({
          id: `integration_${i}`,
          type: 'Knowledge Base',
          data: {
            name: `${integration.description}`,
            prompt: `Accessing knowledge base for ${integration.description}...`,
            kb: integration.endpoint || integration.description
          }
        });
      } else if (integration.type === 'transfer') {
        nodes.push({
          id: `integration_${i}`,
          type: 'Transfer Node',
          data: {
            name: `${integration.description}`,
            prompt: `Transferring for ${integration.description}...`,
            transferNumber: integration.endpoint || ''
          }
        });
      }
    }
  }

  // Add global fallback if enabled
  if (args.advanced_features?.global_fallbacks) {
    nodes.push({
      id: 'global_fallback',
      type: 'Default',
      data: {
        name: 'General Assistance',
        isGlobal: true,
        globalLabel: 'user needs help or has questions',
        prompt: `I'm here to help with any questions about our ${args.name} process.
                 What specific assistance do you need?
                 Previous context: {{prevNodePrompt}}`
      }
    });
  }

  // Completion node
  nodes.push({
    id: 'workflow_completion',
    type: 'Default',
    data: {
      name: 'Workflow Completion',
      prompt: `Great! We've completed the ${args.name} process.
               ${args.workflow_description.split('.').slice(-1)[0]}.
               Is there anything else you need assistance with?`,
      extractVars: [
        ['completion_status', 'string', 'Status of workflow completion'],
        ['user_satisfaction', 'string', 'User satisfaction with the process'],
        ['additional_needs', 'boolean', 'Whether user has additional needs']
      ]
    }
  });

  // End node
  nodes.push({
    id: 'workflow_end',
    type: 'End Call',
    data: {
      name: 'Process Complete',
      prompt: `Thank you for using our ${args.name} service. 
               The process is now complete. Have a great day!`
    }
  });

  // Create dynamic edges based on the workflow structure
  let currentSource = 'workflow_start';
  
  // Connect data collection nodes
  if (args.required_data_points) {
    for (let i = 0; i < args.required_data_points.length; i++) {
      edges.push({
        id: `edge_data_${i}`,
        source: currentSource,
        target: `data_${i}`,
        label: i === 0 ? 'ready to collect data' : 'previous data collected'
      });
      currentSource = `data_${i}`;
    }
  }

  // Connect decision nodes
  if (args.decision_points) {
    for (let i = 0; i < args.decision_points.length; i++) {
      edges.push({
        id: `edge_decision_${i}`,
        source: currentSource,
        target: `decision_${i}`,
        label: i === 0 ? 'data collection complete' : 'previous decision made'
      });
      currentSource = `decision_${i}`;
    }
  }

  // Connect integrations
  if (args.integrations) {
    for (let i = 0; i < args.integrations.length; i++) {
      edges.push({
        id: `edge_integration_${i}`,
        source: currentSource,
        target: `integration_${i}`,
        label: `requires ${args.integrations[i].type} integration`
      });
      currentSource = `integration_${i}`;
    }
  }

  // Connect to completion
  edges.push({
    id: 'edge_completion',
    source: currentSource,
    target: 'workflow_completion',
    label: 'workflow steps complete'
  });

  edges.push({
    id: 'edge_end',
    source: 'workflow_completion',
    target: 'workflow_end',
    label: 'user satisfied and ready to end'
  });

  return { name: args.name, description: args.workflow_description, nodes, edges };
} 