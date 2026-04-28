# Rheumatology Consultant Companion

Standalone React application designed as an innovative digital workspace for:

- Rheumatology consultant decision support
- Patient education journeys
- Practical daily symptom and adherence tools

## Live URLs

- Production: [https://rheumatology-consultant-companion.netlify.app](https://rheumatology-consultant-companion.netlify.app)
- GitHub: [https://github.com/drmahmoodhachim-gif/rheumatology-consultant-companion](https://github.com/drmahmoodhachim-gif/rheumatology-consultant-companion)

## Key Features

- **Disease Activity Assistant** with interactive sliders and risk-state indicator
- **Consultation Timeline** with saveable visit snapshots and trend awareness
- **Patient Education Studio** with stage-based tracks (new diagnosis, flare, long-term care)
- **Patient Tools** for medication adherence tracking, flare journaling, and report handoff
- **Exportable Clinical Report** as downloadable text summary
- **Persistent Local Data** using browser localStorage

## GCC AIR Integration Readiness

This app is now styled and structured to be incorporated into larger sites (like GCC AIR) later:

- CSS is **scoped under `.rcc-app`** to reduce style collisions with host pages.
- Supports **embed mode** using `?embed=1` query param.
- Standalone and embed variants share the same core logic and data handling.

### Embed URL

- `https://rheumatology-consultant-companion.netlify.app/?embed=1`

### Example iframe embed

```html
<iframe
  src="https://rheumatology-consultant-companion.netlify.app/?embed=1"
  title="GCC AIR Rheumatology Consultant Companion"
  style="width:100%;min-height:1200px;border:0;border-radius:16px;"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
