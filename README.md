# QuickCheck - TTB Label Verification

AI-powered label verification system that uses GPT-4 Vision to verify alcohol beverage labels against TTB compliance requirements in under 5 seconds.

## Quick Start

```bash
# Backend (Terminal 1)
cd backend && npm install && cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev

# Frontend (Terminal 2)
cd frontend && npm install && npm run dev
# Open http://localhost:5173
```

**Prerequisites:** Node.js 18+, OpenAI API key

## What This Does

**Single Label Verification:**
- Upload a label image (handles glare, condensation, poor angles)
- Enter expected values (brand, type, ABV, volume, government warning)
- Get instant verification with confidence scores
- See exactly what passed/failed and why

**Batch Processing (up to 50 labels):**
- Upload multiple images at once
- **Option A:** Upload CSV with expected data (download template provided)
- **Option B:** Fill in interactive table manually
- Bulk actions (apply standard warning to all rows)
- One-click verification for entire batch
- Parallel processing (5 concurrent) for speed

**Sample Labels:**
- 3 pre-loaded samples for quick testing
- Single mode: Click individual samples
- Batch mode: Load all 3 at once
- No manual data entry needed

## How to Use

### Single Label Workflow
1. Switch to "Single Label" mode
2. Upload a label image (or click a sample)
3. Fill in expected values
   - Standard warning has a checkbox (no typing needed)
   - Custom warning option available
4. Click "Start Verification"
5. View results with confidence scores

### Batch Workflow
1. Switch to "Batch Processing" mode
2. Upload multiple images (or load samples)
3. Choose data entry method:
   - Upload CSV (recommended for 10+ labels)
   - Manual table entry (good for small batches)
4. Review/edit table
5. Click "Verify All Labels"
6. View summary (X/50 passed) with individual results

### CSV Format
```csv
filename,brand_name,class_type,alcohol_content,net_contents,use_standard_warning
weller.jpg,Weller,Kentucky Straight Bourbon Whiskey,45% Alc./Vol. (90 Proof),1.75 L,yes
abc.jpg,ABC DISTILLERY,Whisky,50% ALC/VOL,750 ML,yes
el-tesoro.jpg,EL TESORO,TEQUILA BLANCO,40% ALC./VOL.,750ml,yes
```

## Architecture

```
Frontend (React + TypeScript + Vite + Tailwind)
    ↓
    REST API (Express + TypeScript)
    ↓
    GPT-4 Vision API (OpenAI)
```

**Tech Stack:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Hot Toast
- **Backend:** Express.js, TypeScript, OpenAI SDK
- **AI:** GPT-4 Vision for OCR + semantic understanding

**Project Structure:**
```
ttb-label-verification/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── UploadZone.tsx
│   │   │   ├── ExpectedValueForm.tsx
│   │   │   ├── BatchDataTable.tsx
│   │   │   └── CSVUpload.tsx
│   │   ├── services/api.ts    # API client
│   │   ├── data/samples.ts    # Sample labels
│   │   └── App.tsx
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/            # API endpoints
    │   ├── services/          # OpenAI integration + fuzzy matching
    │   └── server.ts
    └── package.json
```

## Design Decisions

### 1. GPT-4 Vision over Traditional OCR
**Why:** GPT-4 Vision handles:
- Poor quality images (glare, condensation, curved bottles)
- Varied fonts and layouts
- Semantic understanding (knows what a "government warning" looks like)
- Consistently fast (<5s processing time)

**Alternative considered:** Azure Computer Vision / Tesseract OCR  
**Reason for rejection:** Lower accuracy on imperfect images, requires more preprocessing

### 2. Fuzzy Matching (90% threshold)
**Why:** Real-world labels have formatting differences:
- "ABC DISTILLERY" vs "abc distillery" → Should pass
- "Stone's Throw" vs "STONE'S THROW" → Should pass
- Handles punctuation/spacing differences

**Algorithm:** Levenshtein distance with 90% similarity threshold  
**Exception:** Government warning uses EXACT matching (required by TTB regulation)

### 3. Hybrid Government Warning Input
**Why:** UX optimization for real workflow:
- 99% of labels use standard warning → Checkbox (fast)
- 1% have custom warnings → Textarea option
- Reduces typing from 200 characters to 1 click

### 4. Batch CSV Upload + Manual Entry
**Why:** Supports both workflows from stakeholder interviews:
- **Sarah (Deputy Director):** "200-300 label applications at once" → CSV upload
- **Jenny (Junior Agent):** Small batches → Manual table entry
- Flexibility for different use cases

### 5. TypeScript Throughout
**Why:** 
- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Self-documenting code (types as documentation)
- Easier to maintain and refactor

### 6. Parallel Batch Processing (5 concurrent)
**Why:**
- Balance between speed and API rate limits
- 50 labels processed in ~50 seconds vs 4+ minutes sequential
- Prevents OpenAI API throttling
- Total time = MAX(individual times), not SUM

## Performance

**Batch Processing Speed:**
- Processes 5 labels concurrently (parallel processing)
- Total time = longest individual label time (MAX), not sum of all times
- Example: 3 labels taking 4.26s, 4.27s, 5.63s = **5.63s total** (not 14.16s)
- 50 labels = ~10 batches × 5s = **~50 seconds**

**Why Parallel Processing is Fast:**
```
Sequential (one at a time):
  50 labels × 5s each = 250 seconds (4+ minutes)

Parallel (5 at once):
  50 labels ÷ 5 batches × 5s per batch = 50 seconds
  
Speed improvement: 5x faster
```

## API Documentation

### POST `/api/verify-label`
Verify a single label.

**Request:**
```json
{
  "image": "base64_encoded_image_string",
  "expected": {
    "brandName": "Weller",
    "classType": "Kentucky Straight Bourbon Whiskey",
    "alcoholContent": "45% Alc./Vol. (90 Proof)",
    "netContents": "1.75 L",
    "governmentWarning": "GOVERNMENT WARNING: (1) According to..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "overallPass": true,
  "processingTimeSeconds": 4.26,
  "extracted": {
    "brandName": "Weller",
    "classType": "Kentucky Straight Bourbon Whiskey",
    "alcoholContent": "45% Alc./Vol. 90 Proof",
    "netContents": "1.75 L",
    "governmentWarning": "GOVERNMENT WARNING: (1) According to..."
  },
  "verification": {
    "brandName": { 
      "pass": true, 
      "confidence": 1.0,
      "message": "Exact match"
    },
    "alcoholContent": { 
      "pass": true, 
      "confidence": 0.98,
      "message": "Format differs but content similar"
    }
  },
  "mismatches": []
}
```

### POST `/api/verify-batch`
Verify multiple labels in parallel.

**Request:**
```json
{
  "images": ["base64_image_1", "base64_image_2", "base64_image_3"],
  "expectedValues": [
    { "brandName": "Weller", "classType": "...", ... },
    { "brandName": "ABC DISTILLERY", "classType": "...", ... },
    { "brandName": "EL TESORO", "classType": "...", ... }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    { "overallPass": true, "processingTimeSeconds": 4.26, ... },
    { "overallPass": true, "processingTimeSeconds": 4.27, ... },
    { "overallPass": false, "processingTimeSeconds": 5.63, ... }
  ],
  "summary": {
    "total": 3,
    "passed": 2,
    "failed": 1,
    "totalProcessingTime": 5.63
  }
}
```

**Note:** `totalProcessingTime` is the MAX of all individual times (parallel processing), not the sum.

## Known Limitations

**Prototype Scope:**
- No user authentication (anyone with URL can use it)
- No usage analytics or audit logging
- API key shared across all users (could hit rate limits)
- No database (all processing is stateless)
- 200 request limit hardcoded in backend

**Image Processing:**
- GPT-4 Vision accuracy depends on image quality
- Very blurry/low-resolution images may fail
- Maximum 10MB per image
- Supported formats: PNG, JPG, JPEG, WEBP

**Batch Processing:**
- Maximum 50 images per batch (frontend validation)
- Processes 5 images concurrently (parallel batches)
- Large batches may take 30-60 seconds total

**Production Considerations Not Implemented:**
- FedRAMP compliance (would use Azure OpenAI in production)
- Rate limiting per user
- HTTPS enforcement (handled by deployment platform)
- Input sanitization beyond basic validation
- Database persistence for audit trail

## Testing

**Manual Testing:**
```bash
# Use the 3 sample labels in the UI
# Single mode: Click individual samples
# Batch mode: "Load All 3 Sample Labels" button
```

**Sample Labels Included:**
1. **Weller Bourbon** - Kentucky Straight Bourbon, 1.75 L, 45% ABV
2. **ABC Distillery** - Whisky, 750 ML, 50% ABV  
3. **El Tesoro** - Tequila Blanco, 750ml, 40% ABV

All three samples include complete expected data and should pass verification when loaded.

**Backend Testing:**
```bash
cd backend
npm test  # Unit tests for fuzzy matching logic
```

**API Testing:**
```bash
# Test single verification
curl -X POST http://localhost:3001/api/verify-label \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## Environment Variables

**Backend `.env`:**
```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
```

## Key Features Addressing Requirements

From the stakeholder interviews:

✅ **Sarah (Deputy Director):** "200-300 label applications at once"  
→ Batch processing with CSV upload, parallel processing

✅ **Dave (Senior Agent):** "STONE'S THROW vs Stone's Throw"  
→ Fuzzy matching with 90% threshold

✅ **Jenny (Junior Agent):** "Images aren't perfectly shot"  
→ GPT-4 Vision handles glare, condensation, poor angles

✅ **Marcus (IT Admin):** "Outside TTB firewall, <5 seconds"  
→ Deployed application accessible via URL, averages 4-5 seconds per label

✅ **All stakeholders:** "Government warning exact match"  
→ Exact string comparison (no fuzzy matching) for warnings

## Notes for Reviewers

- **Sample labels** are the fastest way to test (pre-filled data, instant results)
- **Batch CSV template** can be downloaded from the UI
- **Government warning checkbox** eliminates manual typing in 99% of cases
- **Processing time** shown in results (typically 4-5 seconds per label)
- **Confidence scores** help explain fuzzy matching decisions
- **Parallel processing** means batch total time = slowest label time, not sum of all

**Quick Demo Path:**
1. Open app → Batch Processing mode
2. Click "Load All 3 Sample Labels"
3. Review pre-filled table
4. Click "Verify 3 Labels"
5. See results in ~5-6 seconds (all 3 processed simultaneously)