"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Assignment } from "../../../lib/api";

export default function CandidatePage() {
  const { token } = useParams<{ token: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answer, setAnswer] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submittedCount, setSubmittedCount] = useState(0);

  async function load() {
    try { setError(""); setAssignment(await api.assignment(token)); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load assessment."); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (token) void load(); }, [token]);

  async function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (!assignment?.next_question || (!answer.trim() && !audio)) return;
    setSaving(true); setError("");
    try {
      if (answer.trim()) await api.answerText(token, assignment.next_question.question_id, answer.trim());
      else if (audio) await api.answerAudio(token, assignment.next_question.question_id, audio);
      setSubmittedCount((count) => count + 1);
      setAnswer(""); setAudio(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Your answer could not be saved."); }
    finally { setSaving(false); }
  }

  async function finish() {
    setSaving(true); setError("");
    try { await api.submit(token); setSubmitted(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not submit assessment."); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="shell centered"><div className="spinner" /><p>Loading your assessment...</p></main>;
  if (error && !assignment) return <main className="shell centered"><ErrorState message={error} retry={load} /></main>;
  if (submitted || assignment?.status === "submitted") return <main className="shell centered"><div className="success-icon">✓</div><p className="eyebrow">Assessment submitted</p><h1>Thank you for your time.</h1><p className="lede">Your responses have been securely submitted. You can close this window.</p></main>;
  const question = assignment?.next_question;
  const answeredCount = question
    ? Math.min(submittedCount, assignment?.total_questions ?? 0)
    : assignment?.total_questions ?? submittedCount;
  const progress = assignment && assignment.total_questions > 0
    ? Math.min(100, Math.max(0, Math.round(
      (answeredCount / assignment.total_questions) * 100
    )))
    : 0;

  return <main className="shell assessment-shell">
    <header className="topbar"><strong>Hiring assessment</strong><span className="tag candidate-tag">Candidate</span></header>
    <section className="assessment-header">
      <p className="eyebrow">Your assessment</p><h1>Take your time. Be specific.</h1>
      <div className="progress-row"><span>{answeredCount} of {assignment?.total_questions ?? 0} answered</span><span>{progress}% complete</span></div>
      <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
    </section>
    {error && <div className="alert error">{error}</div>}
    {question ? <section className="card question-card">
      <div className="question-number">Question {answeredCount + 1}</div><h2>{question.prompt}</h2>
      <form onSubmit={submitAnswer}>
        <label htmlFor="answer">Your answer</label>
        <textarea id="answer" value={answer} onChange={(e) => { setAnswer(e.target.value); if (e.target.value) setAudio(null); }} placeholder="Write your response here..." rows={8} disabled={Boolean(audio)} />
        <div className="or-divider"><span>or upload an audio response</span></div>
        <label className="file-picker" htmlFor="audio"><span>{audio ? audio.name : "Choose an audio file"}</span><input id="audio" type="file" accept="audio/mpeg,audio/wav,audio/webm,audio/ogg" onChange={(e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0] || null; setAudio(file); if (file) setAnswer(""); }} /></label>
        <button type="submit" disabled={saving || (!answer.trim() && !audio)}>{saving ? "Saving..." : "Save answer & continue"}</button>
      </form>
    </section> : <section className="card empty-card"><div className="success-icon">✓</div><h2>All questions answered</h2><p>Review your progress, then submit when you are ready.</p><button onClick={finish} disabled={saving}>{saving ? "Submitting..." : "Submit assessment"}</button></section>}
  </main>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <><div className="alert error">{message}</div><button onClick={retry}>Try again</button></>;
}
