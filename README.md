# Strategy Council

A multi-agent AI system for strategic business decision-making. Strategy Council uses multiple specialized AI agents that analyze your decisions from different perspectives, debate their positions, and synthesize recommendations with confidence levels.

## Features

- **Multi-Agent Analysis**: 6 specialized agents (Financial, Market, Risk, Game Theory, Resource, Chief of Staff) evaluate each decision
- **Agent Deliberation**: Agents with significantly different scores debate and challenge each other's positions
- **Confidence Scoring**: Recommendations include confidence levels based on agent consensus
- **Company Context**: Store your company's financials, strategic goals, and constraints
- **Business Arms Tracking**: Monitor revenue streams, costs, and time investment across business verticals
- **Market Intelligence**: Track competitors, market size (TAM/SAM/SOM), and trends
- **Decision History**: Review past decisions and track outcomes

## AI Provider Options

Strategy Council supports two AI providers:

1. **Claude CLI** (Default): Uses the Claude Code CLI. Requires Claude CLI to be installed and authenticated.
2. **OpenAI API**: Uses OpenAI GPT models. Requires an OpenAI API key.

## Getting Started

### Prerequisites

- Node.js 18+
- One of the following:
  - [Claude CLI](https://github.com/anthropics/claude-code) installed and authenticated
  - OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/strategy-council.git
cd strategy-council
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env.local` file if using OpenAI:
```bash
cp .env.example .env.local
# Edit .env.local with your OpenAI API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Launch

On first launch, you'll be guided through an onboarding wizard to set up:
- Your company details and financials
- Business arms (revenue streams)
- Market data and competitors
- AI provider preferences

You can skip onboarding and configure everything later in Settings.

## Configuration

### AI Provider Settings

Go to **Settings** (via user menu) to:
- Switch between Claude CLI and OpenAI
- Enter your OpenAI API key
- Select OpenAI model (GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo)
- Test your API connection

### Company Data

- **Company Context**: `/context` - Your company's core information, financials, and strategic goals
- **Business Arms**: `/arms` - Revenue streams and business verticals
- **Market Intel**: `/market` - Competitors, market size, and trends

## How It Works

1. **Create a Decision**: Describe your strategic choice and add 2-4 options
2. **Agent Analysis**: Each agent independently evaluates all options
3. **Deliberation**: Agents with significantly different scores debate their positions
4. **Synthesis**: The Chief of Staff synthesizes all perspectives into a recommendation
5. **Review**: See confidence levels, agent reasoning, and any dissenting opinions

## Agent Roles

| Agent | Focus Area |
|-------|------------|
| Financial Analyst | ROI, cash flow, payback periods, expected value |
| Market Analyst | TAM/SAM/SOM, competitive positioning, market timing |
| Risk Agent | Execution, market, technical, and financial risks |
| Game Theory | Nash equilibrium, first-mover advantage, network effects |
| Resource Allocation | Time investment, bottlenecks, delegation opportunities |
| Chief of Staff | Synthesis, consensus building, final recommendation |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **AI**: Claude CLI or OpenAI API
- **Storage**: File-based JSON (data/ directory)

## Project Structure

```
strategy-council/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── arms/              # Business arms page
│   ├── context/           # Company context page
│   ├── decisions/         # Decision pages
│   ├── instructions/      # Help/instructions page
│   ├── market/            # Market intel page
│   └── settings/          # Settings page
├── components/            # React components
├── data/                  # JSON data storage
├── lib/                   # Utilities and business logic
│   ├── agents/           # AI agent implementations
│   ├── ai-client.ts      # Unified AI interface
│   ├── claude-cli.ts     # Claude CLI wrapper
│   ├── openai-client.ts  # OpenAI client
│   ├── storage.ts        # Data persistence
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details
