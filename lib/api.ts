export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export type Question = { question_id: string; position: number; prompt: string };
export type Assignment = { status: string; next_question: Question | null; answered_count: number; total_questions: number };
export type Candidate = { candidate_id: string; candidate_name: string; email: string; role: string; answer_count: number };
export type Answer = {
  answer_id: string; candidate_id: string; candidate_name: string; question_id: string; question: string;
  answer_text: string | null; audio_path: string | null; audio_url: string | null; suggested_score: number | null;
  suggested_reason: string | null; effective_score: number | null; scoring_status: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store"
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  assignment: (token: string) => request<Assignment>(`/candidate/assessments/${encodeURIComponent(token)}`),
  answerText: (token: string, questionId: string, answerText: string) =>
    request(`/candidate/assessments/${encodeURIComponent(token)}/answers`, { method: "POST", body: JSON.stringify({ question_id: questionId, answer_text: answerText }) }),
  answerAudio: async (token: string, questionId: string, file: File) => {
    const data = new FormData();
    data.append("file", file);
    const response = await fetch(`${API_URL}/candidate/assessments/${encodeURIComponent(token)}/audio?question_id=${encodeURIComponent(questionId)}`, { method: "POST", body: data, cache: "no-store" });
    if (!response.ok) throw new Error((await response.json().catch(() => null) as { detail?: string } | null)?.detail || "Audio upload failed");
    return response.json();
  },
  submit: (token: string) => request<{ status: string }>(`/candidate/assessments/${encodeURIComponent(token)}/submit`, { method: "POST" }),
  signIn: (email: string) => request<{ label: string; header: string }>("/hr/mock-sign-in", { method: "POST", body: JSON.stringify({ email }) }),
  candidates: (email: string) => request<Candidate[]>("/hr/candidates", { headers: { "X-Mock-HR-Email": email } }),
  answers: (email: string, candidateId: string) => request<Answer[]>(`/hr/candidates/${candidateId}/answers`, { headers: { "X-Mock-HR-Email": email } }),
  override: (email: string, answerId: string, score: number, reason: string) =>
    request(`/hr/answers/${answerId}/score-override`, { method: "POST", headers: { "X-Mock-HR-Email": email }, body: JSON.stringify({ score, reason }) }),
  retry: (email: string, answerId: string) =>
    request(`/hr/answers/${answerId}/retry-score`, { method: "POST", headers: { "X-Mock-HR-Email": email } })
};
