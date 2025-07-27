# Security Guidelines

## API Key Management

**CRITICAL**: Never commit API keys to git repository!

### Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Replace placeholder values in `.env.local` with your actual API keys:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `OPENROUTER_API_KEY` - Your OpenRouter API key (alternative to OpenAI)
   - `GOOGLE_TRANSLATE_API_KEY` - Your Google Translate API key

3. Never commit `.env.local` to git - it's automatically excluded by `.gitignore`

### API Key Security

- **NEVER** share API keys in code, comments, or documentation
- **NEVER** commit environment files containing real keys
- **ALWAYS** use environment variables for sensitive data
- **ROTATE** API keys immediately if accidentally exposed

### File Exclusions

The following files are automatically excluded from git:
- `.env.local` - Contains your actual API keys
- `*.env` - Any environment files
- `**/*key*.py` - Python files containing API keys
- `**/*secret*` - Files containing secrets
- `__pycache__/` - Python cache files

### If Keys Are Exposed

1. **Immediately rotate** all exposed API keys
2. Remove files from git history if committed
3. Update `.env.local` with new keys
4. Never reuse exposed keys

### Development Testing

- Use `.env.example` as template
- Test with mock/dummy keys in development
- Use real keys only in secure local environment
