# Hiring assessment frontend

Next.js and TypeScript frontend for the FastAPI hiring assessment example.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the URL of the FastAPI server (default:
`http://localhost:8000`). Candidate links use `/candidate/<personal-token>`.
The HR workspace is available at `/hr` and uses the backend's explicitly
labelled mock HR sign-in.

The frontend does not contain candidate, question, score, or status fixtures;
all application data is loaded from the API.
