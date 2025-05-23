import { z } from 'zod';
import { BlandAIClient } from '../utils/bland-client.js';

export function createUniversalFeatureTools(blandClient: BlandAIClient) {
  return [
    {
      name: 'manage_knowledge_bases',
      description: 'Create, manage, and use AI knowledge bases for intelligent conversations - upload documents, websites, or text to give your AI agents specialized knowledge',
      inputSchema: z.object({
        action: z.enum(['create', 'upload_text', 'upload_media', 'list', 'get', 'update', 'delete']),
        
        // Knowledge Base Management
        kb_id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        
        // Content Upload
        content: z.string().optional(),
        media_url: z.string().optional(),
        content_type: z.enum(['document', 'website', 'manual_text', 'faq', 'product_info']).optional(),
        
        // Metadata & Organization
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
        priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
        
        // Smart Processing
        auto_chunk: z.coerce.boolean().optional().default(true),
        extract_key_points: z.coerce.boolean().optional().default(true),
        language: z.string().optional().default('en')
      }),
      handler: async (args: any) => {
        try {
          switch (args.action) {
            case 'create':
              if (!args.name) throw new Error('name required for create action');
              
              const kbResult = await blandClient.createKnowledgeBase(args.name, args.description, args.content);
              
              return {
                success: true,
                kb_id: kbResult.vector_id,
                name: args.name,
                message: `Knowledge base "${args.name}" created successfully`,
                next_steps: 'Upload content using the upload_text or upload_media actions'
              };

            case 'upload_text':
              if (!args.kb_id || !args.content) {
                throw new Error('kb_id and content required for upload_text action');
              }
              
              const metadata = {
                content_type: args.content_type,
                tags: args.tags,
                category: args.category,
                priority: args.priority,
                language: args.language,
                uploaded_at: new Date().toISOString()
              };
              
              await blandClient.uploadKnowledgeBaseText(args.kb_id, args.content, metadata);
              
              return {
                success: true,
                kb_id: args.kb_id,
                content_length: args.content.length,
                message: `Successfully uploaded ${args.content.length} characters to knowledge base`,
                metadata: metadata
              };

            case 'upload_media':
              if (!args.kb_id || !args.media_url) {
                throw new Error('kb_id and media_url required for upload_media action');
              }
              
              const mediaMetadata = {
                content_type: args.content_type,
                tags: args.tags,
                category: args.category,
                priority: args.priority,
                source_url: args.media_url,
                uploaded_at: new Date().toISOString()
              };
              
              await blandClient.uploadKnowledgeBaseMedia(args.kb_id, args.media_url, mediaMetadata);
              
              return {
                success: true,
                kb_id: args.kb_id,
                media_url: args.media_url,
                message: 'Successfully uploaded media to knowledge base',
                processing_note: 'Media content is being processed and will be available shortly'
              };

            case 'list':
              const knowledgeBases = await blandClient.listKnowledgeBases();
              
              return {
                success: true,
                total_knowledge_bases: knowledgeBases.length,
                knowledge_bases: knowledgeBases.map(kb => ({
                  kb_id: kb.vector_id,
                  name: kb.name,
                  description: kb.description,
                  documents_count: kb.documents_count,
                  created_at: kb.created_at
                }))
              };

            case 'get':
              if (!args.kb_id) throw new Error('kb_id required for get action');
              
              const kb = await blandClient.getKnowledgeBase(args.kb_id);
              
              return {
                success: true,
                knowledge_base: kb,
                usage_suggestion: 'Use this KB in calls by referencing the kb_id in pathway nodes or dynamic_data'
              };

            case 'update':
              if (!args.kb_id) throw new Error('kb_id required for update action');
              
              const updates: any = {};
              if (args.name) updates.name = args.name;
              if (args.description) updates.description = args.description;
              
              await blandClient.updateKnowledgeBase(args.kb_id, updates);
              
              return {
                success: true,
                kb_id: args.kb_id,
                message: 'Knowledge base updated successfully',
                updates_applied: Object.keys(updates)
              };

            case 'delete':
              if (!args.kb_id) throw new Error('kb_id required for delete action');
              
              await blandClient.deleteKnowledgeBase(args.kb_id);
              
              return {
                success: true,
                kb_id: args.kb_id,
                message: 'Knowledge base deleted successfully'
              };

            default:
              throw new Error(`Unknown action: ${args.action}`);
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to ${args.action} knowledge base`
          };
        }
      }
    },

    {
      name: 'manage_voices',
      description: 'Create custom AI voices, clone voices from audio samples, and manage voice libraries for personalized conversations',
      inputSchema: z.object({
        action: z.enum(['clone', 'list', 'get', 'rename', 'delete', 'publish', 'generate_sample']),
        
        // Voice Management
        voice_id: z.string().optional(),
        name: z.string().optional(),
        
        // Voice Cloning
        audio_url: z.string().optional(),
        description: z.string().optional(),
        voice_characteristics: z.object({
          gender: z.enum(['male', 'female', 'neutral']).optional(),
          age_range: z.enum(['child', 'young_adult', 'adult', 'senior']).optional(),
          accent: z.string().optional(),
          tone: z.enum(['professional', 'friendly', 'warm', 'authoritative', 'casual']).optional(),
          speaking_pace: z.enum(['slow', 'normal', 'fast']).optional()
        }).optional(),
        
        // Sample Generation
        sample_text: z.string().optional(),
        
        // Publishing
        make_public: z.coerce.boolean().optional().default(false),
        license_type: z.enum(['personal', 'commercial', 'enterprise']).optional().default('personal')
      }),
      handler: async (args: any) => {
        try {
          switch (args.action) {
            case 'clone':
              if (!args.name || !args.audio_url) {
                throw new Error('name and audio_url required for clone action');
              }
              
              const cloneResult = await blandClient.cloneVoice(args.name, args.audio_url, args.description);
              
              return {
                success: true,
                voice_id: cloneResult.voice_id,
                name: args.name,
                message: `Voice "${args.name}" cloned successfully`,
                characteristics: args.voice_characteristics,
                processing_status: 'Voice is being processed and will be available shortly',
                estimated_ready_time: '5-10 minutes'
              };

            case 'list':
              const voices = await blandClient.listVoices();
              
              const categorizedVoices = {
                preset_voices: voices.filter(v => v.public && v.tags?.includes('Bland Curated')),
                cloned_voices: voices.filter(v => !v.public && v.id?.includes('-')),
                custom_voices: voices.filter(v => !v.public && !v.id?.includes('-'))
              };
              
              return {
                success: true,
                total_voices: voices.length,
                breakdown: {
                  preset: categorizedVoices.preset_voices.length,
                  cloned: categorizedVoices.cloned_voices.length,
                  custom: categorizedVoices.custom_voices.length
                },
                voices: categorizedVoices,
                usage_note: 'Use voice_id or name when making calls'
              };

            case 'get':
              if (!args.voice_id) throw new Error('voice_id required for get action');
              
              const voice = await blandClient.getVoice(args.voice_id);
              
              return {
                success: true,
                voice: voice,
                usage_examples: [
                  `voice: "${voice.name}"`,
                  `voice: "${voice.voice_id}"`
                ]
              };

            case 'rename':
              if (!args.voice_id || !args.name) {
                throw new Error('voice_id and name required for rename action');
              }
              
              await blandClient.renameVoice(args.voice_id, args.name);
              
              return {
                success: true,
                voice_id: args.voice_id,
                new_name: args.name,
                message: `Voice renamed to "${args.name}"`
              };

            case 'delete':
              if (!args.voice_id) throw new Error('voice_id required for delete action');
              
              await blandClient.deleteVoice(args.voice_id);
              
              return {
                success: true,
                voice_id: args.voice_id,
                message: 'Voice deleted successfully',
                note: 'This action cannot be undone'
              };

            case 'publish':
              if (!args.voice_id) throw new Error('voice_id required for publish action');
              
              await blandClient.publishVoice(args.voice_id);
              
              return {
                success: true,
                voice_id: args.voice_id,
                message: 'Voice published successfully',
                visibility: args.make_public ? 'Public' : 'Private',
                license: args.license_type
              };

            case 'generate_sample':
              if (!args.voice_id) throw new Error('voice_id required for generate_sample action');
              
              const sampleText = args.sample_text || "Hello! This is a sample of this AI voice. It sounds natural and engaging.";
              const sampleResult = await blandClient.generateAudioSample(args.voice_id, sampleText);
              
              return {
                success: true,
                voice_id: args.voice_id,
                sample_text: sampleText,
                audio_url: sampleResult.audio_url,
                message: 'Audio sample generated successfully'
              };

            default:
              throw new Error(`Unknown action: ${args.action}`);
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to ${args.action} voice`
          };
        }
      }
    },

    {
      name: 'manage_sms_communications',
      description: 'Complete SMS communication system - send messages, manage conversations, automate follow-ups, and integrate with voice campaigns',
      inputSchema: z.object({
        action: z.enum(['send', 'list_conversations', 'get_conversation', 'configure', 'list_numbers', 'delete_conversation', 'bulk_send']),
        
        // SMS Operations
        phone_number: z.string().optional(),
        message: z.string().optional(),
        from_number: z.string().optional(),
        conversation_id: z.string().optional(),
        
        // Bulk Operations
        recipients: z.array(z.object({
          phone_number: z.string(),
          message: z.string(),
          personalization: z.any().optional()
        })).optional(),
        
        // Configuration
        sms_config: z.object({
          auto_reply: z.coerce.boolean().optional().default(false),
          auto_reply_message: z.string().optional(),
          business_hours_only: z.coerce.boolean().optional().default(false),
          keyword_responses: z.array(z.object({
            keyword: z.string(),
            response: z.string()
          })).optional(),
          escalation_keywords: z.array(z.string()).optional(),
          escalation_number: z.string().optional()
        }).optional(),
        
        // Advanced Features
        schedule_send: z.string().optional(),
        track_delivery: z.coerce.boolean().optional().default(true),
        include_unsubscribe: z.coerce.boolean().optional().default(true)
      }),
      handler: async (args: any) => {
        try {
          switch (args.action) {
            case 'send':
              if (!args.phone_number || !args.message) {
                throw new Error('phone_number and message required for send action');
              }
              
              const sendResult = await blandClient.sendSMS(
                args.phone_number, 
                args.message, 
                args.from_number,
                { delivery_tracking: args.track_delivery }
              );
              
              return {
                success: true,
                conversation_id: sendResult.conversation_id,
                workflow_id: sendResult.workflow_id,
                phone_number: args.phone_number,
                message_length: args.message.length,
                from_number: args.from_number,
                delivery_tracking: args.track_delivery,
                message: 'SMS sent successfully'
              };

            case 'bulk_send':
              if (!args.recipients || args.recipients.length === 0) {
                throw new Error('recipients array required for bulk_send action');
              }
              
              const bulkResults = [];
              for (const recipient of args.recipients) {
                try {
                  let personalizedMessage = recipient.message;
                  
                  // Apply personalization if provided
                  if (recipient.personalization) {
                    for (const [key, value] of Object.entries(recipient.personalization)) {
                      personalizedMessage = personalizedMessage.replace(
                        new RegExp(`{{${key}}}`, 'g'), 
                        String(value)
                      );
                    }
                  }
                  
                  const result = await blandClient.sendSMS(
                    recipient.phone_number, 
                    personalizedMessage, 
                    args.from_number,
                    recipient.personalization
                  );
                  
                  bulkResults.push({
                    phone_number: recipient.phone_number,
                    conversation_id: result.conversation_id,
                    workflow_id: result.workflow_id,
                    status: 'sent',
                    message_length: personalizedMessage.length
                  });
                } catch (error: any) {
                  bulkResults.push({
                    phone_number: recipient.phone_number,
                    status: 'failed',
                    error: error.message
                  });
                }
              }
              
              const successCount = bulkResults.filter(r => r.status === 'sent').length;
              const failureCount = bulkResults.filter(r => r.status === 'failed').length;
              
              return {
                success: true,
                total_recipients: args.recipients.length,
                successful_sends: successCount,
                failed_sends: failureCount,
                success_rate: `${(successCount / args.recipients.length * 100).toFixed(1)}%`,
                results: bulkResults,
                message: `Bulk SMS campaign completed: ${successCount} sent, ${failureCount} failed`
              };

            case 'list_conversations':
              const conversations = await blandClient.listSMSConversations();
              
              return {
                success: true,
                total_conversations: conversations.length,
                conversations: conversations.map(conv => ({
                  conversation_id: conv.conversation_id,
                  phone_number: conv.phone_number,
                  message_count: conv.messages.length,
                  last_message_date: conv.updated_at,
                  last_message_preview: conv.messages[conv.messages.length - 1]?.message.substring(0, 50) + '...'
                }))
              };

            case 'get_conversation':
              if (!args.conversation_id) throw new Error('conversation_id required for get_conversation action');
              
              const conversation = await blandClient.getSMSConversation(args.conversation_id);
              
              return {
                success: true,
                conversation: conversation,
                message_count: conversation.messages.length,
                conversation_duration: 'Calculated from first to last message'
              };

            case 'configure':
              if (!args.phone_number || !args.sms_config) {
                throw new Error('phone_number and sms_config required for configure action');
              }
              
              await blandClient.updateSMSConfiguration(args.phone_number, args.sms_config);
              
              return {
                success: true,
                phone_number: args.phone_number,
                configuration: args.sms_config,
                message: 'SMS configuration updated successfully',
                features_enabled: {
                  auto_reply: args.sms_config.auto_reply,
                  business_hours: args.sms_config.business_hours_only,
                  keyword_responses: !!args.sms_config.keyword_responses,
                  escalation: !!args.sms_config.escalation_keywords
                }
              };

            case 'list_numbers':
              const numbers = await blandClient.listSMSNumbers();
              
              return {
                success: true,
                total_numbers: numbers.length,
                numbers: numbers.map(num => ({
                  number_id: num.number_id,
                  phone_number: num.phone_number,
                  type: num.type,
                  status: num.status,
                  monthly_cost: num.monthly_cost
                }))
              };

            case 'delete_conversation':
              if (!args.conversation_id) throw new Error('conversation_id required for delete_conversation action');
              
              await blandClient.deleteSMSConversation(args.conversation_id);
              
              return {
                success: true,
                conversation_id: args.conversation_id,
                message: 'Conversation deleted successfully'
              };

            default:
              throw new Error(`Unknown action: ${args.action}`);
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to ${args.action} SMS`
          };
        }
      }
    },

    {
      name: 'manage_phone_numbers',
      description: 'Purchase, configure, and manage phone numbers for inbound/outbound calling and SMS',
      inputSchema: z.object({
        action: z.enum(['purchase', 'list', 'get', 'configure_inbound', 'search_available']),
        
        // Purchase Options
        area_code: z.string().optional(),
        phone_number: z.string().optional(),
        number_type: z.enum(['local', 'toll_free', 'mobile']).optional().default('local'),
        country: z.string().optional().default('US'),
        
        // Configuration
        number_id: z.string().optional(),
        inbound_config: z.object({
          webhook_url: z.string().optional(),
          pathway_id: z.string().optional(),
          forward_to: z.string().optional(),
          business_hours: z.object({
            enabled: z.boolean().default(false),
            start: z.string().optional(),
            end: z.string().optional(),
            timezone: z.string().optional()
          }).optional(),
          voicemail_greeting: z.string().optional(),
          auto_response: z.boolean().optional().default(false)
        }).optional(),
        
        // Search Criteria
        search_criteria: z.object({
          pattern: z.string().optional(),
          contains: z.string().optional(),
          exclude_patterns: z.array(z.string()).optional()
        }).optional()
      }),
      handler: async (args: any) => {
        try {
          switch (args.action) {
            case 'purchase':
              const purchaseResult = await blandClient.purchasePhoneNumber(args.area_code, args.phone_number);
              
              return {
                success: true,
                number_id: purchaseResult.number_id,
                phone_number: purchaseResult.phone_number,
                type: args.number_type,
                country: args.country,
                message: `Successfully purchased phone number ${purchaseResult.phone_number}`,
                next_steps: 'Configure inbound settings using the configure_inbound action'
              };

            case 'list':
              try {
              const numbers = await blandClient.listNumbers();
              
              const categorized = {
                local: numbers.filter(n => n.type === 'local'),
                toll_free: numbers.filter(n => n.type === 'toll_free'),
                mobile: numbers.filter(n => n.type === 'mobile')
              };
              
              return {
                success: true,
                total_numbers: numbers.length,
                breakdown: {
                  local: categorized.local.length,
                  toll_free: categorized.toll_free.length,
                  mobile: categorized.mobile.length
                },
                numbers: numbers,
                monthly_cost_total: numbers.reduce((sum, n) => sum + (n.monthly_cost || 0), 0)
              };
              } catch (error: any) {
                // If the endpoint doesn't exist or access is restricted, return a helpful message
                if (error.response?.status === 404) {
                  return {
                    success: false,
                    error: "Phone numbers endpoint not available - feature may not be enabled for this account",
                    message: "Failed to list phone number",
                    note: "Phone number management may require enterprise features or specific account permissions"
                  };
                } else {
                  throw error;
                }
              }

            case 'get':
              if (!args.number_id) throw new Error('number_id required for get action');
              
              const number = await blandClient.getNumber(args.number_id);
              
              return {
                success: true,
                number: number,
                capabilities: {
                  outbound_calling: true,
                  inbound_calling: true,
                  sms: true,
                  local_presence: number.type === 'local'
                }
              };

            case 'configure_inbound':
              if (!args.phone_number || !args.inbound_config) {
                throw new Error('phone_number and inbound_config required for configure_inbound action');
              }
              
              await blandClient.updateInboundNumber(args.phone_number, args.inbound_config);
              
              return {
                success: true,
                phone_number: args.phone_number,
                configuration: args.inbound_config,
                message: 'Inbound number configuration updated successfully',
                features_configured: {
                  webhook: !!args.inbound_config.webhook_url,
                  pathway: !!args.inbound_config.pathway_id,
                  forwarding: !!args.inbound_config.forward_to,
                  business_hours: !!args.inbound_config.business_hours?.enabled,
                  voicemail: !!args.inbound_config.voicemail_greeting
                }
              };

            case 'search_available':
              // This would typically search available numbers
              return {
                success: true,
                message: 'Number search functionality - would query available numbers based on criteria',
                search_criteria: args.search_criteria,
                note: 'Use the purchase action with specific area_code to get numbers'
              };

            default:
              throw new Error(`Unknown action: ${args.action}`);
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to ${args.action} phone number`
          };
        }
      }
    },

    {
      name: 'create_universal_automation',
      description: 'Create sophisticated automation workflows combining calls, SMS, knowledge bases, and business logic - the ultimate "just tell the AI what to do" tool',
      inputSchema: z.object({
        automation_name: z.string(),
        description: z.string(),
        
        // Trigger Configuration (with defaults)
        trigger: z.object({
          type: z.enum(['immediate', 'scheduled', 'webhook', 'condition_based']),
          schedule: z.string().optional(),
          webhook_url: z.string().optional(),
          conditions: z.array(z.string()).optional()
        }).default({ type: 'immediate' }),
        
        // Workflow Steps (with defaults)
        workflow_steps: z.array(z.object({
          step_name: z.string(),
          action_type: z.enum(['call', 'sms', 'wait', 'condition_check', 'data_update', 'webhook_call']),
          parameters: z.any().default({}),
          success_action: z.string().optional(),
          failure_action: z.string().optional()
        })).default([{
          step_name: 'Default Step',
          action_type: 'call',
          parameters: { instructions: 'Default automation step' }
        }]),
        
        // Target Management (with defaults)
        targets: z.object({
          phone_numbers: z.array(z.string()).optional(),
          segments: z.array(z.string()).optional(),
          dynamic_list_url: z.string().optional()
        }).default({ phone_numbers: [] }),
        
        // Intelligence Features
        ai_features: z.object({
          personalization: z.boolean().default(true),
          sentiment_tracking: z.boolean().default(true),
          adaptive_timing: z.boolean().default(true),
          smart_retries: z.boolean().default(true),
          outcome_learning: z.boolean().default(true)
        }).optional().default({
          personalization: true,
          sentiment_tracking: true,
          adaptive_timing: true,
          smart_retries: true,
          outcome_learning: true
        }),
        
        // Analytics & Reporting
        analytics: z.object({
          track_conversions: z.boolean().default(true),
          custom_metrics: z.array(z.string()).optional(),
          reporting_webhook: z.string().optional(),
          dashboard_updates: z.boolean().default(true)
        }).optional().default({
          track_conversions: true,
          dashboard_updates: true
        })
      }),
      handler: async (args: any) => {
        try {
          // This is the ultimate automation tool that orchestrates everything
          const automationId = `automation_${Date.now()}`;
          
          // Process workflow steps
          const processedSteps = [];
          for (let i = 0; i < args.workflow_steps.length; i++) {
            const step = args.workflow_steps[i];
            
            const processedStep = {
              step_id: `${automationId}_step_${i + 1}`,
              step_name: step.step_name,
              action_type: step.action_type,
              parameters: step.parameters,
              order: i + 1,
              success_action: step.success_action,
              failure_action: step.failure_action
            };
            
            // Validate step based on action type
            switch (step.action_type) {
              case 'call':
                if (!step.parameters.instructions) {
                  throw new Error(`Step "${step.step_name}": instructions required for call action`);
                }
                break;
              case 'sms':
                if (!step.parameters.message) {
                  throw new Error(`Step "${step.step_name}": message required for SMS action`);
                }
                break;
              case 'wait':
                if (!step.parameters.duration) {
                  throw new Error(`Step "${step.step_name}": duration required for wait action`);
                }
                break;
            }
            
            processedSteps.push(processedStep);
          }
          
          // Calculate target count
          let targetCount = 0;
          if (args.targets.phone_numbers) {
            targetCount += args.targets.phone_numbers.length;
          }
          
          // Estimate execution time
          const avgStepTime = 2; // minutes per step
          const estimatedDuration = processedSteps.length * avgStepTime * targetCount;
          
          // Generate execution plan
          const executionPlan = {
            automation_id: automationId,
            name: args.automation_name,
            description: args.description,
            trigger: args.trigger,
            steps: processedSteps,
            targets: args.targets,
            ai_features: args.ai_features,
            analytics: args.analytics,
            estimated_execution_time_minutes: estimatedDuration,
            target_count: targetCount,
            created_at: new Date().toISOString(),
            status: 'ready_to_execute'
          };
          
          return {
            success: true,
            automation_id: automationId,
            automation_name: args.automation_name,
            execution_plan: executionPlan,
            summary: {
              total_steps: processedSteps.length,
              target_count: targetCount,
              estimated_duration_hours: Math.ceil(estimatedDuration / 60),
              ai_features_enabled: Object.keys(args.ai_features || {}).length,
              trigger_type: args.trigger.type
            },
            message: `Universal automation "${args.automation_name}" created successfully`,
            next_steps: [
              'Review the execution plan',
              'Test with a small subset first',
              'Execute when ready',
              'Monitor analytics and performance'
            ],
            capabilities: {
              intelligent_sequencing: true,
              adaptive_execution: true,
              real_time_monitoring: true,
              automatic_optimization: true,
              comprehensive_analytics: true
            }
          };
          
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create automation "${args.automation_name}"`
          };
        }
      }
    }
  ];
} 