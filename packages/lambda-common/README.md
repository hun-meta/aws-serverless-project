# @your-username/lambda-common

Common utilities and services for Lambda functions.

## Installation

```bash
npm install @your-username/lambda-common
```

## Usage

```typescript
import { BaseService, CustomException, LoggerService } from '@your-username/lambda-common';

// Use LoggerService
const logger = LoggerService.getInstance();
logger.info('MyContext', 'Hello World');

// Extend BaseService
class MyService extends BaseService {
  constructor() {
    super('MyContext', '001', logger);
  }
}
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run build:watch

# Test
npm run test

# Lint
npm run lint
```

## License

MIT