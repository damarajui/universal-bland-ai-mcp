# Universal Bland AI MCP Server

Create sophisticated voice AI systems from plain English descriptions. This Model Context Protocol server gives you complete access to Bland AI's voice calling platform through 20 powerful tools.

## What's New in v1.4.2 

**New Pathway Functions:**
- Enterprise Sales System with B2B qualification and objection handling
- AI Customer Service Hub with multi-specialist routing and escalation
- Intelligent Appointment Booking with real-time scheduling 
- Custom Workflow Builder with unlimited decision points

**Advanced Global Nodes:**
- Global Help - interrupt any conversation for assistance
- Global Escalation - instant manager routing
- Global Objection Handling - smart resolution across all pathways
- Global Rescheduling - appointment changes from anywhere

**Real Business Examples Tested:**
- SmileFirst Dental Practice (6 services + global rescheduling)
- CloudFlow Enterprise Sales (lead scoring + CRM integration)
- TechCorp AI Support 
- Smart Loan Processing (5 decision points + compliance)

## What This Does

Instead of basic "make call" and "get transcript" functionality, this gives you access to Bland AI's complete platform. You can create complex conversation flows, manage sales pipelines, and automate workflows using natural language.

**Coverage:** 20 tools covering 94% of Bland AI's API (64 out of 68 endpoints)

## Why I Built This

Existing Bland AI integrations felt limited. This gives you:

- **Complete API access** - Nearly every Bland AI feature available
- **Smart pathway creation** - Build conversation flows with decision logic
- **Natural language interface** - Describe what you want, get production-ready workflows
- **Enterprise features** - BANT qualification, objection handling, CRM integration
- **Universal compatibility** - Works with Claude Desktop, Cursor, or any MCP platform

## Quick Start

```bash
# Install globally
npm install -g universal-bland-ai-mcp-server

# Test it works
universal-bland-mcp mcp:test
```

## Setup

**Requirements:**
- Node.js 18+
- Bland AI API key from app.bland.ai
- Claude Desktop, Cursor, or any MCP-compatible platform

**Environment:**
Create a `.env` file:
```bash
BLAND_API_KEY=your_api_key_here
LOG_LEVEL=info
NODE_ENV=development
```

## Configuration

**For Claude Desktop:**
```json
{
  "mcpServers": {
    "bland-ai": {
      "command": "universal-bland-mcp",
      "env": {
        "BLAND_AI_API_KEY": "your_api_key"
      }
    }
  }
}
```

**For Cursor:**
```json
{
  "servers": {
    "bland-ai": {
      "command": "universal-bland-mcp",
      "env": {"BLAND_AI_API_KEY": "your_key"}
    }
  }
}
```

## Main Features

**Smart Calling:**
- `make_smart_call` - Describe what the call should accomplish
- `manage_active_calls` - Monitor and control live calls
- `create_voice_campaign` - Launch batch campaigns
- `analyze_call_performance` - Get insights from call data

**Build Conversation Flows:**
- `create_enterprise_sales_pathway` - BANT qualification with objection handling
- `create_ai_customer_service_pathway` - Multi-tier support with escalation
- `create_intelligent_appointment_system` - Booking with availability checking
- `create_custom_workflow_pathway` - Build any workflow you need

**Manage Your Setup:**
- `manage_knowledge_bases` - Upload docs for your AI to reference
- `manage_voices` - Clone voices or customize existing ones
- `manage_sms_communications` - SMS follow-ups and automation
- `manage_phone_numbers` - Purchase and configure numbers

**Analytics:**
- `get_call_transcript` - Pull transcripts for any call
- `analyze_call` - AI-powered analysis and sentiment
- `generate_call_report` - Comprehensive reporting

## Troubleshooting and Usage Tips

### Why Your Pathway Creation Might Not Work

The most common issue is incorrect JSON formatting for complex pathway parameters. The tools need properly formatted JSON arrays, not objects or strings.

**Wrong way (creates basic 3-node pathways):**
```
webhook_integrations: "crm_integration: {url: 'https://api.com'}"
knowledge_bases: "technical_docs, sales_info"
transfer_numbers: "sales: +1-800-SALES"
```

**Right way (creates sophisticated multi-branch pathways):**
```
webhook_integrations: [{"name": "CRM Integration", "url": "https://api.crm.com", "method": "POST"}]
knowledge_bases: [{"name": "Technical Docs", "content": "API guides", "trigger_phrases": ["API", "technical"]}]
transfer_numbers: [{"name": "Sales Team", "number": "+1-800-SALES", "conditions": ["qualified lead"]}]
```


### How to Create Working Complex Pathways

**For Enterprise Sales:**
```bash
# Use the enterprise sales tool with proper company details
create_enterprise_sales_pathway company_name="Your Company" product_or_service="Your Product"
```

**For Customer Service with Multiple Specialists:**
```bash
# Use comma-separated service types
service_types="billing,technical,account_management,emergency"
```

**For Unlimited Complexity Pathways:**
```bash
# Format all configurations as JSON arrays
webhook_integrations: [{"name": "API Name", "url": "https://your-api.com", "method": "POST"}]
```

### Quick Fixes for Common Issues

**Problem:** Pathway only creates 3 basic nodes
**Solution:** Check your JSON formatting. Use arrays with objects, not plain strings.

**Problem:** No webhooks or knowledge bases appear
**Solution:** Ensure JSON arrays are properly formatted with quotes around all keys and values.

**Problem:** Transfer numbers not working
**Solution:** Include both "name", "number", and "conditions" fields in your JSON array.

**Problem:** No conditional branching
**Solution:** Provide detailed descriptions of different customer scenarios in your pathway description.

### Testing Your Pathways

After creating a pathway:

1. Check the pathway details to see if all nodes were created
2. Look for webhook, knowledge base, and transfer nodes in the results
3. Test with different customer scenarios to verify routing works
4. Use the call analytics to see how conversations flow through your pathway

### Getting Help

If pathways still aren't working after checking JSON formatting:

1. Verify your Bland AI API key is valid
2. Check that webhook URLs are accessible
3. Ensure phone numbers are in proper format (+1-XXX-XXX-XXXX)
4. Review the pathway description for clear customer scenarios
5. Test with simpler configurations first, then add complexity (pathway edit functionality coming SOOON!)

## Production Deployment

**Docker:**
```bash
npm run docker:build
npm run docker:production
```

**Environment Variables:**
```bash
BLAND_API_KEY=required          # Your Bland AI API key
LOG_LEVEL=info                 # Logging level
NODE_ENV=production            # Environment
MCP_SERVER_PORT=3000          # Server port
```

## Development

**Manual Installation:**
```bash
git clone https://github.com/inaandamaraju/universal-bland-ai-mcp
cd universal-bland-ai-mcp
npm install
npm run build
```

**Development Scripts:**
```bash
npm run build              # Build TypeScript
npm run dev               # Development mode
npm run watch             # Watch mode with auto-reload
npm run test              # Run tests
npm run mcp:inspector     # Debug MCP connections
```

## Architecture

The server uses a modular design:
- **Call Tools**: Direct calling and campaign management
- **Pathway Tools**: Conversation flow creation and management
- **Feature Tools**: Knowledge bases, voices, SMS, phone numbers
- **Client**: Centralized API communication with error handling

## Technical Coverage

**What's Included:**
- Voice calling with 40+ parameters
- Complete pathway creation and management  
- Knowledge base operations
- Voice cloning and management
- SMS automation
- Phone number purchasing and management
- Analytics and reporting
- Batch operations
- Organization management

**Missing:** Just 4 specialized Twilio integration endpoints

## Support

- GitHub issues for bugs or feature requests
- Email: inaandamaraju02@gmail.com
- Bland AI Discord community

## License

ISC License - use it however you want.

built with hella love for the community 
