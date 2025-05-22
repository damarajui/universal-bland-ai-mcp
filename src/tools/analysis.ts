import { z } from 'zod';
import { BlandAIClient } from '../utils/bland-client.js';

export function createAnalysisTools(blandClient: BlandAIClient) {
  return [
    {
      name: 'get_call_transcript',
      description: 'Get the transcript of a completed call',
      inputSchema: z.object({
        call_id: z.string()
      }),
      handler: async (args: any) => {
        const result = await blandClient.getCallTranscript(args.call_id);
        return {
          call_id: args.call_id,
          transcript: result.transcript,
          corrected_transcript: result.corrected_transcript
        };
      }
    },

    {
      name: 'analyze_call',
      description: 'Get AI analysis of a call including summary and sentiment',
      inputSchema: z.object({
        call_id: z.string()
      }),
      handler: async (args: any) => {
        const analysis = await blandClient.analyzeCall(args.call_id);
        return {
          call_id: args.call_id,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
          keywords: analysis.keywords
        };
      }
    },

    {
      name: 'generate_call_report',
      description: 'Generate a comprehensive report for multiple calls',
      inputSchema: z.object({
        call_ids: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(10)
      }),
      handler: async (args: any) => {
        let calls;
        if (args.call_ids) {
          calls = await Promise.all(
            args.call_ids.map((id: string) => blandClient.getCall(id))
          );
        } else {
          calls = await blandClient.listCalls(args.limit);
        }

        const completed_calls = calls.filter(call => call.status === 'completed');
        const total_duration = completed_calls.reduce((sum, call) => sum + (call.duration || 0), 0);
        const avg_duration = completed_calls.length > 0 ? total_duration / completed_calls.length : 0;

        const status_summary = calls.reduce((acc, call) => {
          acc[call.status] = (acc[call.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          total_calls: calls.length,
          completed_calls: completed_calls.length,
          total_duration_minutes: Math.round(total_duration / 60),
          average_duration_minutes: Math.round(avg_duration / 60),
          status_breakdown: status_summary,
          success_rate: completed_calls.length / calls.length * 100
        };
      }
    }
  ];
} 