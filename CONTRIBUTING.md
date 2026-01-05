# Contributing to Startup Strategy Council

Thank you for your interest in contributing to Startup Strategy Council! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (OS, Node.js version, browser)
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- A clear description of the feature
- The problem it solves
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following the code style guidelines below
4. **Test your changes**: Ensure the app runs correctly with `npm run dev`
5. **Commit your changes** with a clear commit message
6. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/startup-strategy-council.git
cd startup-strategy-council

# Install dependencies
npm install

# Start development server
npm run dev
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define types for all function parameters and return values
- Avoid `any` types when possible

### React/Next.js
- Use functional components with hooks
- Follow the existing component structure
- Use shadcn/ui components where applicable

### File Organization
- Place new pages in `app/` directory following Next.js App Router conventions
- Place reusable components in `components/`
- Place utility functions in `lib/`
- Place types in `lib/types.ts`

### Naming Conventions
- Components: PascalCase (`DecisionCard.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- CSS classes: Use Tailwind CSS utilities

### Commits
- Use clear, descriptive commit messages
- Reference issue numbers when applicable (`Fix #123: ...`)

## Project Structure

```
├── app/              # Next.js pages and API routes
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities, types, and business logic
│   └── agents/      # AI agent implementations
├── data/            # JSON data storage (gitignored in production)
└── public/          # Static assets
```

## Adding New Agents

To add a new agent to the council:

1. Create the agent prompt in `lib/agents/`
2. Add the agent type to `lib/types.ts`
3. Register the agent in `lib/agents/index.ts`
4. Update the UI to display the new agent's analysis

## Testing

Currently, the project uses manual testing. When contributing:
- Test all affected functionality manually
- Verify the app builds without errors: `npm run build`
- Check for TypeScript errors: `npx tsc --noEmit`

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with your question
- Check existing issues and discussions

## License

By contributing to Startup Strategy Council, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing! 🙏
