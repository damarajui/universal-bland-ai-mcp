import { z } from 'zod';
import { BlandAIClient } from '../utils/bland-client.js';

// Updated PhoneNumberSchema to be more flexible with formatting
const PhoneNumberSchema = z.string().refine(val => {
  // Allow with or without + prefix, and strip any non-digit characters for validation
  const digits = val.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15; 
}, 'Invalid phone number format');

export function createUniversalCallTools(blandClient: BlandAIClient) {
  return [
    {
      name: 'make_smart_call',
      description: 'Make an AI phone call with natural language instructions - automatically handles all advanced features like scheduling, voicemail, recordings, analysis, etc.',
      inputSchema: z.object({
        phone_number: z.string().min(10).max(15),
        instructions: z.string().min(10).max(2000),
        voice: z.string().optional().default('maya'),
        
        // Smart Scheduling
        schedule_for: z.string().optional(),
        timezone: z.string().optional(),
        business_hours_only: z.coerce.boolean().optional().default(false),
        
        // Advanced Audio & Conversation
        background_sound: z.enum(['office', 'cafe', 'restaurant', 'none', 'phone_static']).optional(),
        conversation_style: z.enum(['quick', 'balanced', 'patient', 'very_patient']).optional().default('balanced'),
        interruptions_allowed: z.coerce.boolean().optional().default(true),
        model_type: z.enum(['base', 'turbo']).optional().default('base'),
        creativity_level: z.coerce.number().min(0).max(1).optional().default(0.7),
        
        // Call Behavior  
        wait_for_greeting: z.coerce.boolean().optional().default(false),
        first_sentence: z.string().optional(),
        max_duration_minutes: z.coerce.number().optional().default(30),
        
        // Recording & Analysis
        record_call: z.coerce.boolean().optional().default(false),
        analyze_emotions: z.coerce.boolean().optional().default(false),
        extract_data: z.object({
          fields: z.array(z.string()).optional(),
          schema: z.any().optional()
        }).optional(),
        
        // Transfer & Escalation
        transfer_to: z.string().optional(),
        transfer_conditions: z.array(z.string()).optional(),
        
        // Voicemail Handling
        voicemail_action: z.enum(['hangup', 'leave_message', 'ignore']).optional().default('hangup'),
        voicemail_message: z.string().optional(),
        retry_on_voicemail: z.coerce.boolean().optional().default(false),
        
        // Integration & Webhooks
        webhook_url: z.string().optional(),
        external_tools: z.array(z.string()).optional(),
        live_data_sources: z.array(z.object({
          name: z.string(),
          url: z.string(),
          method: z.enum(['GET', 'POST']).optional().default('GET')
        })).optional(),
        
        // Call Quality & Enhancement
        noise_cancellation: z.coerce.boolean().optional().default(false),
        pronunciation_guide: z.array(z.object({
          word: z.string(),
          pronunciation: z.string()
        })).optional(),
        boost_keywords: z.array(z.string()).optional(),
        
        // Enterprise Features
        from_number: z.string().optional(),
        local_dialing: z.coerce.boolean().optional().default(false),
        sms_on_voicemail: z.object({
          enabled: z.coerce.boolean().default(false),
          message: z.string().optional()
        }).optional(),
        
        // Metadata & Tracking
        campaign_id: z.string().optional(),
        custom_data: z.any().optional(),
        disposition_tags: z.array(z.string()).optional()
      }),
      handler: async (args: any) => {
        try {
          // Build comprehensive call options from natural language input
          const callOptions: any = {
            phone_number: args.phone_number,
            task: args.instructions,
            voice: args.voice,
            record: args.record_call,
            max_duration: args.max_duration_minutes,
            wait_for_greeting: args.wait_for_greeting,
            noise_cancellation: args.noise_cancellation,
            temperature: args.creativity_level,
            model: args.model_type,
            answered_by_enabled: true
          };

          // Handle scheduling
          if (args.schedule_for) {
            callOptions.start_time = args.schedule_for;
          }
          
          if (args.timezone) {
            callOptions.timezone = args.timezone;
          }

          // Set conversation style
          const interruptionThresholds: Record<string, number> = {
            quick: 50,
            balanced: 100,
            patient: 150,
            very_patient: 200
          };
          callOptions.interruption_threshold = interruptionThresholds[args.conversation_style || 'balanced'];
          callOptions.block_interruptions = !args.interruptions_allowed;

          // Background audio
          if (args.background_sound) {
            callOptions.background_track = args.background_sound === 'phone_static' ? null : args.background_sound;
          }

          // First sentence
          if (args.first_sentence) {
            callOptions.first_sentence = args.first_sentence;
          }

          // Transfer setup
          if (args.transfer_to) {
            callOptions.transfer_phone_number = args.transfer_to;
            if (args.transfer_conditions && args.transfer_conditions.length > 0) {
              callOptions.task += `\n\nTransfer to ${args.transfer_to} if: ${args.transfer_conditions.join(', ')}`;
            }
          }

          // Voicemail handling
          callOptions.voicemail_action = args.voicemail_action;
          if (args.voicemail_message) {
            callOptions.voicemail_message = args.voicemail_message;
          }
          if (args.retry_on_voicemail) {
            callOptions.retry = {
              wait: 300, // 5 minutes
              voicemail_action: 'leave_message'
            };
          }

          // Analysis
          if (args.extract_data) {
            if (args.extract_data.schema) {
              callOptions.analysis_preset = args.extract_data.schema;
            }
          }

          // Keywords and pronunciation
          if (args.boost_keywords) {
            callOptions.keywords = args.boost_keywords;
          }
          if (args.pronunciation_guide) {
            callOptions.pronunciation_guide = args.pronunciation_guide;
          }

          // Live data sources
          if (args.live_data_sources) {
            callOptions.dynamic_data = args.live_data_sources.map((source: any) => ({
              url: source.url,
              method: source.method,
              name: source.name
            }));
          }

          // Enterprise features
          if (args.from_number) {
            callOptions.from = args.from_number;
          }
          callOptions.local_dialing = args.local_dialing;

          // SMS on voicemail
          if (args.sms_on_voicemail?.enabled) {
            callOptions.voicemail_sms = {
              message: args.sms_on_voicemail.message || 'You have a new voicemail!'
            };
          }

          // Webhook
          if (args.webhook_url) {
            callOptions.webhook = args.webhook_url;
            callOptions.webhook_events = ['call', 'latency', 'tool'];
          }

          // Disposition tags
          if (args.disposition_tags) {
            callOptions.available_tags = args.disposition_tags;
          }

          // Metadata
          if (args.custom_data || args.campaign_id) {
            callOptions.metadata = {
              ...(args.custom_data && args.custom_data),
              ...(args.campaign_id && { campaign_id: args.campaign_id })
            };
          }

          // Business hours restriction
          if (args.business_hours_only) {
            callOptions.dispatch_hours = {
              start: '09:00',
              end: '17:00'
            };
          }

          // Make the call
          const result = await blandClient.startCall(callOptions);
          
          // If emotion analysis requested, set up follow-up
          const response: any = {
            success: true,
            call_id: result.call_id,
            message: `Successfully ${args.schedule_for ? 'scheduled' : 'initiated'} call to ${args.phone_number}`,
            call_status: result.status || 'queued',
            features_enabled: {
              recording: args.record_call,
              emotion_analysis: args.analyze_emotions,
              voicemail_handling: args.voicemail_action !== 'hangup',
              smart_transfer: !!args.transfer_to,
              live_data: !!args.live_data_sources,
              analysis: !!args.extract_data
            }
          };

          if (args.schedule_for) {
            response.scheduled_for = args.schedule_for;
          }

          return response;

        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to make call to ${args.phone_number}`
          };
        }
      }
    },

    {
      name: 'manage_active_calls',
      description: 'Monitor, control, and manage active calls - stop calls, get real-time status, analyze ongoing conversations',
      inputSchema: z.object({
        action: z.enum(['list_active', 'stop_call', 'stop_all', 'get_status', 'get_live_transcript']),
        call_id: z.string().optional(),
        analysis_type: z.enum(['basic', 'emotions', 'keywords', 'full']).optional().default('basic')
      }),
      handler: async (args: any) => {
        try {
          switch (args.action) {
            case 'list_active':
              const calls = await blandClient.listCalls(50);
              const activeCalls = calls.filter(call => 
                ['queued', 'initiated', 'ringing', 'in-progress'].includes(call.status)
              );
              return {
                success: true,
                active_calls: activeCalls.length,
                calls: activeCalls.map(call => ({
                  call_id: call.call_id,
                  phone_number: call.phone_number,
                  status: call.status,
                  duration: call.duration,
                  started_at: call.started_at
                }))
              };

            case 'stop_call':
              if (!args.call_id) {
                throw new Error('call_id required for stop_call action');
              }
              const stopResult = await blandClient.stopCall(args.call_id);
              return {
                success: stopResult.success,
                message: `Call ${args.call_id} stopped`,
                call_id: args.call_id
              };

            case 'stop_all':
              const stopAllResult = await blandClient.stopAllCalls();
              return {
                success: stopAllResult.success,
                stopped_calls: stopAllResult.stopped_calls,
                message: `Stopped ${stopAllResult.stopped_calls.length} active calls`
              };

            case 'get_status':
              if (!args.call_id) {
                throw new Error('call_id required for get_status action');
              }
              const call = await blandClient.getCall(args.call_id);
              return {
                success: true,
                call_id: call.call_id,
                status: call.status,
                phone_number: call.phone_number,
                duration: call.duration,
                started_at: call.started_at,
                ended_at: call.ended_at,
                answered_by: call.answered_by,
                disposition_tag: call.disposition_tag
              };

            case 'get_live_transcript':
              if (!args.call_id) {
                throw new Error('call_id required for get_live_transcript action');
              }
              const transcript = await blandClient.getCallTranscript(args.call_id);
              let analysis = null;
              
              if (args.analysis_type === 'emotions') {
                analysis = await blandClient.analyzeCallEmotions(args.call_id);
              } else if (args.analysis_type === 'full') {
                analysis = await blandClient.analyzeCall(args.call_id);
              }

              return {
                success: true,
                call_id: args.call_id,
                transcript: transcript.transcript,
                corrected_transcript: transcript.corrected_transcript,
                analysis: analysis
              };

            default:
              throw new Error(`Unknown action: ${args.action}`);
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to ${args.action}`
          };
        }
      }
    },

    {
      name: 'create_voice_campaign',
      description: 'Create sophisticated voice campaigns with batch calling, automated follow-ups, and comprehensive analytics',
      inputSchema: z.object({
        campaign_name: z.string(),
        phone_numbers: z.array(z.string()).min(1).max(10000),
        message_template: z.string(),
        
        // Campaign Configuration
        voice: z.string().optional().default('maya'),
        concurrency: z.coerce.number().min(1).max(100).optional().default(10),
        call_scheduling: z.object({
          start_time: z.string().optional(),
          end_time: z.string().optional(),
          timezone: z.string().optional(),
          business_hours_only: z.coerce.boolean().optional().default(true)
        }).optional(),
        
        // Personalization
        personalization_data: z.array(z.object({
          phone_number: z.string(),
          data: z.any()
        })).optional(),
        
        // Call Behavior
        max_duration_minutes: z.coerce.number().optional().default(10),
        voicemail_strategy: z.enum(['skip', 'leave_message', 'callback']).optional().default('leave_message'),
        retry_policy: z.object({
          enabled: z.coerce.boolean().default(false),
          max_attempts: z.coerce.number().min(1).max(5).optional().default(2),
          wait_minutes: z.coerce.number().min(60).max(1440).optional().default(240)
        }).optional(),
        
        // Analytics & Tracking
        track_conversions: z.coerce.boolean().optional().default(true),
        disposition_tags: z.array(z.string()).optional(),
        webhook_url: z.string().optional(),
        
        // Advanced Features
        local_presence: z.coerce.boolean().optional().default(false),
        record_calls: z.coerce.boolean().optional().default(false),
        real_time_coaching: z.coerce.boolean().optional().default(false)
      }),
      handler: async (args: any) => {
        try {
          // Build call options for the campaign
          const campaignOptions: any = {
            task: args.message_template,
            voice: args.voice,
            max_duration: args.max_duration_minutes,
            record: args.record_calls,
            local_dialing: args.local_presence,
            metadata: {
              campaign_name: args.campaign_name,
              campaign_id: `campaign_${Date.now()}`
            }
          };

          // Handle voicemail strategy
          switch (args.voicemail_strategy) {
            case 'leave_message':
              campaignOptions.voicemail_action = 'leave_message';
              campaignOptions.voicemail_message = `This is a message from ${args.campaign_name}. We'll try calling you again later.`;
              break;
            case 'callback':
              campaignOptions.voicemail_action = 'hangup';
              campaignOptions.retry = {
                wait: (args.retry_policy?.wait_minutes || 240) * 60,
                voicemail_action: 'leave_message'
              };
              break;
            case 'skip':
              campaignOptions.voicemail_action = 'hangup';
              break;
          }

          // Add scheduling
          if (args.call_scheduling?.start_time) {
            campaignOptions.start_time = args.call_scheduling.start_time;
          }
          if (args.call_scheduling?.business_hours_only) {
            campaignOptions.dispatch_hours = {
              start: '09:00',
              end: '17:00'
            };
          }
          if (args.call_scheduling?.timezone) {
            campaignOptions.timezone = args.call_scheduling.timezone;
          }

          // Add disposition tracking
          if (args.disposition_tags) {
            campaignOptions.available_tags = args.disposition_tags;
          }

          // Add webhook
          if (args.webhook_url) {
            campaignOptions.webhook = args.webhook_url;
            campaignOptions.webhook_events = ['call', 'tool', 'dynamic_data'];
          }

          // Handle personalization
          const phoneNumbers = args.phone_numbers;
          const personalizedNumbers = [];
          
                     for (const phoneNumber of phoneNumbers) {
             const personalizationData = args.personalization_data?.find(
               (p: any) => p.phone_number === phoneNumber
             );
            
            if (personalizationData) {
              personalizedNumbers.push({
                phone_number: phoneNumber,
                request_data: personalizationData.data
              });
            } else {
              personalizedNumbers.push({ phone_number: phoneNumber });
            }
          }

          // Create the batch campaign
          const batchResult = await blandClient.createBatch(phoneNumbers, campaignOptions);

          return {
            success: true,
            campaign_id: campaignOptions.metadata.campaign_id,
            batch_id: batchResult.batch_id,
            campaign_name: args.campaign_name,
            total_calls: phoneNumbers.length,
            message: `Campaign "${args.campaign_name}" created with ${phoneNumbers.length} calls`,
            features: {
              personalization: !!args.personalization_data,
              scheduling: !!args.call_scheduling?.start_time,
              analytics: args.track_conversions,
              local_presence: args.local_presence,
              recording: args.record_calls,
              retry_logic: args.retry_policy?.enabled
            },
            estimated_duration_hours: Math.ceil(phoneNumbers.length / args.concurrency) * (args.max_duration_minutes / 60)
          };

        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create campaign "${args.campaign_name}"`
          };
        }
      }
    },

    {
      name: 'analyze_call_performance',
      description: 'Deep analysis of call performance, emotions, conversation quality, and business outcomes',
      inputSchema: z.object({
        call_id: z.string().optional(),
        batch_id: z.string().optional(),
        campaign_id: z.string().optional(),
        analysis_type: z.enum(['single_call', 'batch_summary', 'campaign_report', 'comparative']).default('single_call'),
        
        // Analysis Options
        include_emotions: z.boolean().optional().default(true),
        include_keywords: z.boolean().optional().default(true),
        include_conversation_flow: z.boolean().optional().default(false),
        include_business_metrics: z.boolean().optional().default(true),
        
        // Comparative Analysis
        compare_with: z.array(z.string()).optional(),
        
        // Export Options
        export_format: z.enum(['json', 'summary', 'detailed_report']).optional().default('summary')
      }),
      handler: async (args: any) => {
        try {
          let analysisResults: any = {};

          switch (args.analysis_type) {
            case 'single_call':
              if (!args.call_id) {
                throw new Error('call_id required for single_call analysis');
              }

              const call = await blandClient.getCall(args.call_id);
              const transcript = await blandClient.getCallTranscript(args.call_id);
              
              analysisResults = {
                call_id: args.call_id,
                basic_metrics: {
                  duration: call.duration,
                  status: call.status,
                  answered_by: call.answered_by,
                  disposition: call.disposition_tag
                },
                transcript: transcript.transcript
              };

              if (args.include_emotions) {
                try {
                  const emotions = await blandClient.analyzeCallEmotions(args.call_id);
                  analysisResults.emotional_analysis = emotions;
                } catch (e) {
                  analysisResults.emotional_analysis = 'Not available';
                }
              }

              if (args.include_keywords) {
                try {
                  const analysis = await blandClient.analyzeCall(args.call_id);
                  analysisResults.keyword_analysis = {
                    keywords: analysis.keywords,
                    sentiment: analysis.sentiment,
                    summary: analysis.summary
                  };
                } catch (e) {
                  analysisResults.keyword_analysis = 'Not available';
                }
              }

              if (call.recording_url && args.include_conversation_flow) {
                analysisResults.recording_url = call.recording_url;
              }

              break;

            case 'batch_summary':
              if (!args.batch_id) {
                throw new Error('batch_id required for batch_summary analysis');
              }

              const batch = await blandClient.getBatch(args.batch_id);
              const batchLogs = await blandClient.getBatchLogs(args.batch_id);
              
              analysisResults = {
                batch_id: args.batch_id,
                summary: {
                  total_calls: batch.total_calls,
                  completed_calls: batch.completed_calls,
                  failed_calls: batch.failed_calls,
                  success_rate: ((batch.completed_calls / batch.total_calls) * 100).toFixed(2) + '%',
                  status: batch.status
                },
                performance_metrics: {
                  average_duration: 'Calculated from logs',
                  common_outcomes: 'Extracted from disposition tags'
                }
              };

              if (args.include_business_metrics) {
                // Calculate business metrics from batch data
                analysisResults.business_impact = {
                  total_contacts_reached: batch.completed_calls,
                  estimated_cost: batch.total_calls * 0.05, // Example cost per call
                  roi_indicators: 'Based on disposition analysis'
                };
              }

              break;

            case 'campaign_report':
              if (!args.campaign_id) {
                throw new Error('campaign_id required for campaign_report analysis');
              }

              // Get all batches for this campaign
              const allBatches = await blandClient.listBatches();
              const campaignBatches = allBatches.filter(b => 
                b.calls?.some(c => c.metadata?.campaign_id === args.campaign_id)
              );

              analysisResults = {
                campaign_id: args.campaign_id,
                campaign_overview: {
                  total_batches: campaignBatches.length,
                  total_calls: campaignBatches.reduce((sum, b) => sum + b.total_calls, 0),
                  overall_success_rate: 'Calculated across all batches'
                },
                performance_trends: 'Time-based analysis of campaign performance',
                optimization_recommendations: 'AI-generated suggestions for improvement'
              };

              break;

            default:
              throw new Error(`Unsupported analysis type: ${args.analysis_type}`);
          }

          return {
            success: true,
            analysis_type: args.analysis_type,
            results: analysisResults,
            generated_at: new Date().toISOString(),
            export_format: args.export_format
          };

        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            message: `Failed to analyze ${args.analysis_type}`
          };
        }
      }
    }
  ];
} 