# TTB Label Verification - Backend

Express + TypeScript API for AI-powered label verification.

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## Development

```bash
# Run in development mode with hot reload
npm run dev
```

Server runs on `http://localhost:3001`

## Production

```bash
# Build TypeScript
npm run build

# Run production server
npm start
```

## API Endpoints

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-08T12:00:00.000Z",
  "openaiConfigured": true
}
```

### POST /api/verify-label
Verify a single label.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "expected": {
    "brandName": "OLD TOM DISTILLERY",
    "classType": "Kentucky Straight Bourbon Whiskey",
    "alcoholContent": "45% Alc./Vol.",
    "netContents": "750 mL",
    "governmentWarning": "GOVERNMENT WARNING: ..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "overallPass": true,
  "processingTimeSeconds": 3.2,
  "extracted": { ... },
  "verification": { ... },
  "mismatches": []
}
```

### POST /api/verify-batch
Verify multiple labels (max 50).

**Request:**
```json
{
  "images": ["base64_1", "base64_2", ...],
  "expectedValues": [{ ... }, { ... }, ...]
}
```

## Environment Variables

- `OPENAI_API_KEY` - Required. Your OpenAI API key
- `PORT` - Optional. Server port (default: 3001)
- `NODE_ENV` - Optional. Environment (development/production)

## Testing

```bash
npm test
```

## Project Structure

```
src/
├── routes/
│   └── api.ts              # API route handlers
├── services/
│   ├── aiService.ts        # GPT-4 Vision integration
│   ├── verificationService.ts  # Verification logic
│   └── imageProcessor.ts   # Image preprocessing
├── types/
│   └── index.ts            # TypeScript types
└── server.ts               # Express server setup
```

## Key Features

- **Fast Processing**: <5 second response time per label
- **Fuzzy Matching**: Handles "STONE'S THROW" vs "Stone's Throw"
- **Exact Warning Validation**: Government warning must be exact
- **Batch Processing**: Up to 50 labels, 5 concurrent
- **Rate Limiting**: 10 requests/minute per IP
- **Image Optimization**: Auto-resize large images

## Deployment

### Railway

1. Create new project in Railway
2. Connect GitHub repo
3. Set root directory to `backend`
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variable: `OPENAI_API_KEY`
6. Deploy
