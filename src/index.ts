#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BlandAIClient } from './utils/bland-client.js';
import { createUniversalCallTools } from './tools/calls.js';
import { createPathwayTools } from './tools/pathways.js';
import { createAnalysisTools } from './tools/analysis.js';
import { createUniversalFeatureTools } from './tools/universal-features.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const BLAND_API_KEY = process.env.BLAND_AI_API_KEY;
const BLAND_ORG_ID = process.env.BLAND_AI_ORG_ID || undefined; // Make properly optional

if (!BLAND_API_KEY) {
  console.error('BLAND_AI_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Bland AI client - organization ID is optional
const blandClient = new BlandAIClient(BLAND_API_KEY, BLAND_ORG_ID);

// Create MCP server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'bland-ai-mcp',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Combine all tools
const allTools = [
  ...createUniversalCallTools(blandClient),
  ...createPathwayTools(blandClient),
  ...createAnalysisTools(blandClient),
  ...createUniversalFeatureTools(blandClient)
];

// Register list_tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema.shape ? {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(tool.inputSchema.shape).map(([key, value]) => [
            key,
            { type: typeof value === 'object' && value && 'type' in value ? value.type : 'string' }
          ])
        )
      } : {
        type: 'object',
        properties: {}
      }
    }))
  };
});

// Register call_tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  
  console.error(`Received request for tool: ${name}`);
  
  const tool = allTools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Tool ${name} not found`);
  }

  try {
    // Log the arguments received (for debugging)
    console.error(`Tool arguments:`, JSON.stringify(args));
    
    // Validate input
    const validatedArgs = tool.inputSchema.parse(args);
    
    // Execute tool
    const result = await tool.handler(validatedArgs);
    
    console.error(`Tool execution successful: ${name}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    console.error(`Tool execution error (${name}):`, error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      const errorMessage = `Invalid input: ${error.errors.map((e: any) => e.message).join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Handle Bland AI API errors
    if (error.response?.data) {
      const errorMessage = `Bland AI API Error: ${error.response.data.message || error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Generic error
    const errorMessage = `Tool execution failed: ${error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Bland AI MCP Server running on stdio');
  console.error(`Server name: ${process.env.MCP_SERVER_NAME || 'bland-ai-mcp'}`);
  console.error(`Server version: ${process.env.MCP_SERVER_VERSION || '1.0.0'}`);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.error('Shutting down server...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Start the server
main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 