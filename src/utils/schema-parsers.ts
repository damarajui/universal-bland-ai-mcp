import { z } from 'zod';

/**
 * Utility functions for parsing MCP string inputs into proper types for Bland AI API
 */

export function parseStringToArray(input: string | string[], fieldName: string): string[] {
  if (Array.isArray(input)) {
    return input;
  }
  
  if (typeof input !== 'string') {
    throw new Error(`${fieldName}: Expected string or array, received ${typeof input}`);
  }
  
  try {
    // Try parsing as JSON array first
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    throw new Error('Not an array');
  } catch {
    // If JSON parsing fails, try comma-separated values
    if (input.includes(',')) {
      return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    // Single value
    return input.length > 0 ? [input] : [];
  }
}

export function parseStringToObject(input: string | object, fieldName: string): object {
  if (typeof input === 'object' && input !== null) {
    return input;
  }
  
  if (typeof input !== 'string') {
    throw new Error(`${fieldName}: Expected string or object, received ${typeof input}`);
  }
  
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    throw new Error('Not an object');
  } catch (error) {
    throw new Error(`${fieldName}: Invalid JSON object format. Expected valid JSON or object. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function parseStringToBoolean(input: string | boolean, fieldName: string): boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  
  if (typeof input !== 'string') {
    throw new Error(`${fieldName}: Expected string or boolean, received ${typeof input}`);
  }
  
  const lower = input.toLowerCase().trim();
  if (lower === 'true' || lower === '1' || lower === 'yes') {
    return true;
  }
  if (lower === 'false' || lower === '0' || lower === 'no' || lower === '') {
    return false;
  }
  
  throw new Error(`${fieldName}: Invalid boolean value "${input}". Expected true/false, yes/no, 1/0`);
}

export function parseStringToNumber(input: string | number, fieldName: string): number {
  if (typeof input === 'number') {
    return input;
  }
  
  if (typeof input !== 'string') {
    throw new Error(`${fieldName}: Expected string or number, received ${typeof input}`);
  }
  
  const parsed = Number(input);
  if (isNaN(parsed)) {
    throw new Error(`${fieldName}: Invalid number value "${input}"`);
  }
  
  return parsed;
}

// Enhanced Zod schemas with proper parsing
export const parseableStringArray = (fieldName: string) => 
  z.union([z.string(), z.array(z.string())])
    .transform((input) => parseStringToArray(input, fieldName));

export const parseableStringObject = (fieldName: string) => 
  z.union([z.string(), z.object({}).passthrough()])
    .transform((input) => parseStringToObject(input, fieldName));

export const parseableStringBoolean = (fieldName: string) => 
  z.union([z.string(), z.boolean()])
    .transform((input) => parseStringToBoolean(input, fieldName));

export const parseableStringNumber = (fieldName: string) => 
  z.union([z.string(), z.number()])
    .transform((input) => parseStringToNumber(input, fieldName));

// FIXED: Specific parsers for complex Bland AI structures
export function parseCustomTools(input: string | object[]): object[] {
  if (Array.isArray(input)) {
    return input;
  }
  
  if (typeof input !== 'string') {
    throw new Error('custom_tools: Expected string or array of objects');
  }
  
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      throw new Error('custom_tools: Must be an array of tool objects');
    }
    
    // Validate each tool has required fields per Bland AI docs
    for (const tool of parsed) {
      if (!tool.name || !tool.description || !tool.api_endpoint || !tool.input_schema) {
        throw new Error('custom_tools: Each tool must have name, description, api_endpoint, and input_schema');
      }
      
      // Validate input_schema structure
      if (!tool.input_schema.type || tool.input_schema.type !== 'object') {
        throw new Error('custom_tools: input_schema.type must be "object"');
      }
      
      if (!tool.input_schema.properties) {
        throw new Error('custom_tools: input_schema must have properties');
      }
      
      // Validate response_data if present
      if (tool.response_data && !Array.isArray(tool.response_data)) {
        throw new Error('custom_tools: response_data must be an array');
      }
      
      // FIXED: Validate response_data structure matches Bland docs
      if (tool.response_data && Array.isArray(tool.response_data)) {
        for (const responseItem of tool.response_data) {
          if (!responseItem.name || !responseItem.data) {
            throw new Error('custom_tools: response_data items must have name and data fields');
          }
        }
      }
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`custom_tools: Invalid JSON format. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function parseDynamicDataSources(input: string | object[]): object[] {
  if (Array.isArray(input)) {
    return input;
  }
  
  if (typeof input !== 'string') {
    throw new Error('dynamic_data: Expected string or array of objects');
  }
  
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      throw new Error('dynamic_data: Must be an array of data source objects');
    }
    
    // Validate each data source matches Bland AI's structure
    for (const source of parsed) {
      if (!source.url) {
        throw new Error('dynamic_data: Each data source must have url');
      }
      
      // Validate method if present
      if (source.method && !['GET', 'POST'].includes(source.method)) {
        throw new Error('dynamic_data: method must be GET or POST');
      }
      
      // Validate response_data structure if present
      if (source.response_data && Array.isArray(source.response_data)) {
        for (const responseItem of source.response_data) {
          if (!responseItem.name || !responseItem.data) {
            throw new Error('dynamic_data: response_data items must have name and data fields');
          }
        }
      }
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`dynamic_data: Invalid JSON format. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced parsers for Bland AI compatibility
export const parseableCustomTools = (fieldName: string) => 
  z.union([z.string(), z.array(z.object({}).passthrough())])
    .transform((input) => parseCustomTools(input));

export const parseableDynamicData = (fieldName: string) => 
  z.union([z.string(), z.array(z.object({}).passthrough())])
    .transform((input) => parseDynamicDataSources(input));

// Voice ID parser to handle both string names and numeric IDs
export function parseVoiceId(input: string | number): string | number {
  if (typeof input === 'number') {
    return input;
  }
  
  if (typeof input === 'string') {
    // If it's a numeric string, convert to number
    const numericValue = Number(input);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
    // Otherwise keep as string (voice name)
    return input;
  }
  
  throw new Error('voice_id: Expected string or number');
}

export const parseableVoiceId = () => 
  z.union([z.string(), z.number()])
    .transform((input) => parseVoiceId(input)); 