This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## My assessment solution

### Source Map

## Endpoints
- app/api/patients
    `route.ts` - this is my utility endpoint to just lazily load all the patients
- app/api/risk/assessment
    `route.ts` - this is the main endpoint that fetches patients, and conducts risk assessment THEN returns 200 OK response with patients and statistics

## Services, business logic and utilities
- lib/models
    `ApiResponse.ts`
    `Patient.ts`
    `Statistics`
- lib
    `service.ts` - contains all business logic, fetching patients and conducting risk assessment analysis...
- public
    `ksensetech_web_dev.postman_collection.json` - My exported postman collection used during development

### Core Services & Models

* **`lib/service.ts`:** Contains the business logic. This handles the data fetching orchestration and executes the algorithms for risk analysis.
* **`lib/models/ApiResponse.ts`:** Defines the interfaces for KST's GET `/api/patients` API responses.
* **`lib/models/Patient.ts`:** Contains the core data structures and type definitions for patient records.
* **`lib/models/Statistics.ts`:** Defines the data models used for calculating and returning the final assessment statistics to be submitted to kst.

I almost forgot.
### Environment Variables.
**create .env and add these two env variables**
- `KSENSE_TECH_API_BASE_URL` - the API base url for KST with the /api part please.
- `KSENSE_TECH_API_KEY` - the API key
