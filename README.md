# Universal Bland AI MCP Server

I built this to solve a problem I kept running into: existing Bland AI integrations were way too basic. While tools like Zapier's MCP only give you 4 simple functions, I wanted something that could actually harness the full power of Bland AI's platform.

## What This Is

This MCP server gives you access to Bland AI's entire voice calling platform through 20 carefully crafted tools. Instead of being limited to basic "send call" and "get transcript" actions, you can now create sophisticated conversation flows, manage enterprise sales pipelines, and automate complex workflows - all through natural language commands.


## Why I Built This

The existing integrations felt underdeveloped.

Here's what makes this different:

- **Near-complete API coverage** - 64 out of 68 endpoints implemented
- **Smart pathway creation** - Build conversation flows with 17+ node types and decision logic
- **Natural language interface** - Describe what you want in plain English, get production-ready workflows
- **Enterprise-grade features** - BANT qualification, objection handling, CRM integration, the works
- **Universal compatibility** - Works with Claude Desktop, Cursor, or any MCP-compatible platform

## Getting Started

You'll need:
- Node.js 18+
- A Bland AI API key (grab one from app.bland.ai)
- Claude Desktop, Cursor, or any MCP-compatible platform

### Easy Installation (Recommended)

Just install the package globally:

```bash
npm install -g universal-bland-ai-mcp-server
```

That's it! No need to clone, build, or manage the codebase.

### Manual Installation (For Development)

If you want to modify the code:

```bash
git clone https://github.com/inaandamaraju/universal-bland-ai-mcp
cd universal-bland-ai-mcp
npm install
npm run build
```

### Setup

Create a `.env` file with your API key:

```bash
BLAND_API_KEY=your_api_key_here
LOG_LEVEL=info
NODE_ENV=development
```

### Quick Test

Make sure everything's working:

```bash
npm run mcp:test
```

You should see all 20 tools load up successfully.

## Setting Up Your AI Platform

### For Claude Desktop

If you installed globally via NPM:

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

If you cloned the repository:

```json
{
  "mcpServers": {
    "bland-ai": {
      "command": "node",
      "args": ["/path/to/universal-bland-ai-mcp/build/index.js"],
      "env": {
        "BLAND_AI_API_KEY": "your_api_key"
      }
    }
  }
}
```

### For Cursor

If you installed globally via NPM:

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

If you cloned the repository:

```json
{
  "servers": {
    "bland-ai": {
      "command": "node build/index.js",
      "env": {"BLAND_AI_API_KEY": "your_key"}
    }
  }
}
```


## What You Can Do With It

### Smart Calling
- `make_smart_call` - Just describe what you want the call to accomplish
- `manage_active_calls` - Monitor and control live calls
- `create_voice_campaign` - Launch batch campaigns with smart targeting  
- `analyze_call_performance` - Get insights from your call data

### Build Conversation Flows
- `create_enterprise_sales_pathway` - BANT qualification with objection handling
- `create_ai_customer_service_pathway` - Multi-tier support with escalation
- `create_intelligent_appointment_system` - Booking with availability checking
- `create_custom_workflow_pathway` - Build whatever workflow you need

### Manage Your Setup  
- `manage_knowledge_bases` - Upload docs/data for your AI to reference
- `manage_voices` - Clone voices or customize existing ones
- `manage_sms_communications` - SMS follow-ups and automation
- `manage_phone_numbers` - Purchase and configure numbers
- `create_universal_automation` - Chain together complex workflows

### Analytics & Intelligence
- `get_call_transcript` - Pull transcripts for any call
- `analyze_call` - AI-powered analysis and sentiment
- `generate_call_report` - Comprehensive reporting across calls

## Going to Production

### Docker (Easy Route)

```bash
npm run docker:build
npm run docker:production
```

### Kubernetes (Enterprise Route)

I've included K8s manifests if you need to scale this thing:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bland-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bland-mcp
  template:
    spec:
      containers:
      - name: bland-mcp
        image: universal-bland-mcp:latest
        env:
        - name: BLAND_API_KEY
          valueFrom:
            secretKeyRef:
              name: bland-secrets
              key: api-key
```

## Configuration Options

### Environment Variables

```bash
BLAND_API_KEY=required          # Bland AI API key
LOG_LEVEL=info                 # Logging level
NODE_ENV=production            # Environment
MCP_SERVER_PORT=3000          # Server port
ENABLE_METRICS=true           # Performance monitoring
```

### Advanced Settings

```typescript
// Pathway configuration
const pathwayConfig = {
  nodes: 17,
  decisionPoints: 4,
  apiIntegrations: 3,
  webhookSupport: true,
  leadScoring: true,
  objectionHandling: true
};
```

## Architecture

The server implements a modular architecture with separate components for:

- **Call Tools**: Direct calling and campaign management
- **Pathway Tools**: Conversation flow creation and management
- **Feature Tools**: Knowledge bases, voices, SMS, and phone numbers
- **Client**: Centralized API communication with error handling
- **Configuration**: Environment management and validation
- **Logging**: Structured logging for production monitoring

## Technical Details

I've implemented 94% of Bland AI's API (64 out of 68 endpoints). The missing 4 are just some specialized Twilio integration stuff.

What's covered:
- Voice calling with 40+ parameters
- Complete pathway creation and management  
- Knowledge base operations
- Voice cloning and management
- SMS automation
- Phone number purchasing and management
- Analytics and reporting
- Batch operations
- Organization management

### Development Scripts

```bash
npm run build              # Build TypeScript  
npm run dev               # Development mode
npm run watch             # Watch mode with auto-reload
npm run test              # Run tests
npm run lint              # Code linting
npm run type-check        # TypeScript validation  
npm run mcp:inspector     # Debug MCP connections
```


## Questions or Issues?

- Open an issue on GitHub if something's broken
- Hit me up on the Bland AI Discord or at inaandamaraju02@gmail.com

## License

ISC License - use it however you want.

---