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

Account mock for testing

1. Candidate (two for testing)

Personal link token: y8wzWrYgUHt2cGgHdhI0k3jPab0d2VDP8G7mN9YXmc4
Personal link path: /candidate/assessments/y8wzWrYgUHt2cGgHdhI0k3jPab0d2VDP8G7mN9YXmc4

=========================

Personal link token: v0ToKAmfo9pjjTf7LJU-Y8Fkfi0K5EmKW4u5q-0C-jE
Personal link path: /candidate/assessments/v0ToKAmfo9pjjTf7LJU-Y8Fkfi0K5EmKW4u5q-0C-jE

2. HR
Email: hr@example.com
