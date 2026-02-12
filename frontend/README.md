# TTB Label Verification - Frontend

React + TypeScript frontend for the TTB Label Verification system.

## Setup

```bash
# Install dependencies
npm install

# Configure environment (optional for local development)
cp .env.example .env
# Edit .env if backend is not on localhost:3001
```

## Development

```bash
# Run development server
npm run dev
```

Frontend runs on `http://localhost:5173`

Make sure the backend is running on `http://localhost:3001` (or update `VITE_API_URL` in `.env`)

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

### Single Label Mode
- Upload one label image
- Enter expected values for all required fields
- Get instant verification results with field-by-field breakdown
- See confidence scores and mismatch details

### Batch Processing Mode
- Upload up to 50 label images at once
- Use same expected values for all labels
- View summary statistics (total, passed, failed)
- Expand individual results for detailed analysis

## UI Design

The interface is designed with accessibility in mind:
- **Large click targets** (minimum 44px for buttons)
- **High contrast** ratios for text
- **Clear visual feedback** for all interactions
- **Keyboard navigation** support
- **Screen reader** friendly
- **Simple, clean design** - easy for non-technical users

## Components

- **UploadZone** - Drag-and-drop file upload with preview
- **ExpectedValueForm** - Form for entering expected label data
- **VerificationResults** - Single label results display
- **BatchResults** - Batch verification results with expandable cards

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **react-dropzone** - File upload
- **axios** - HTTP client
- **react-hot-toast** - Notifications

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=<your-backend-url>`
5. Deploy

### Netlify

1. Push code to GitHub
2. Import project in Netlify
3. Set base directory to `frontend`
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variable: `VITE_API_URL=<your-backend-url>`
7. Deploy

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
