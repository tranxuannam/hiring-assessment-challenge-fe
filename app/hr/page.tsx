"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { API_URL, api, Answer, Candidate } from "../../lib/api";

export default function HRPage() {
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { const stored = window.localStorage.getItem("mock_hr_email"); if (stored) { setEmail(stored); setSignedIn(true); void loadCandidates(stored); } }, []);
  async function loadCandidates(hrEmail = email) { setLoading(true); setError(""); try { setCandidates(await api.candidates(hrEmail)); } catch (err) { setError(err instanceof Error ? err.message : "Could not load candidates."); } finally { setLoading(false); } }
  async function signIn(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); try { await api.signIn(email); window.localStorage.setItem("mock_hr_email", email); setSignedIn(true); await loadCandidates(email); } catch (err) { setError(err instanceof Error ? err.message : "Sign-in failed."); setLoading(false); } }
  async function selectCandidate(candidate: Candidate) { setSelected(candidate); setError(""); try { setAnswers(await api.answers(email, candidate.candidate_id)); } catch (err) { setError(err instanceof Error ? err.message : "Could not load answers."); } }
  const grouped = useMemo(() => candidates.reduce<Record<string, Candidate[]>>((groups, candidate) => { (groups[candidate.role] ||= []).push(candidate); return groups; }, {}), [candidates]);

  if (!signedIn) return <main className="shell centered"><div className="brand-mark">H</div><span className="tag hr-tag">Mock HR access</span><h1>Sign in to review</h1><p className="lede">This is a demo sign-in for the assessment workspace.</p><form className="auth-form" onSubmit={signIn}><label htmlFor="email">HR email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hr@example.com" required />{error && <div className="alert error">{error}</div>}<button disabled={loading}>{loading ? "Signing in..." : "Sign in (mock)"}</button></form></main>;
  return <main className="shell hr-shell"><header className="topbar"><div><strong>Hiring assessment</strong><span className="muted">HR review workspace</span></div><div className="top-actions"><span className="tag hr-tag">Mock HR</span><button className="text-button" onClick={() => { window.localStorage.removeItem("mock_hr_email"); setSignedIn(false); }}>Sign out</button></div></header>{error && <div className="alert error">{error}</div>}<div className="hr-layout"><aside className="candidate-sidebar"><div className="section-heading"><div><p className="eyebrow">Candidates</p><h2>Review queue</h2></div><button className="icon-button" onClick={() => void loadCandidates()} aria-label="Refresh candidates">↻</button></div>{loading && <p className="muted">Loading...</p>}{Object.entries(grouped).map(([role, items]) => <div className="role-group" key={role}><h3>{role}</h3>{items.map((candidate) => <button className={`candidate-item ${selected?.candidate_id === candidate.candidate_id ? "selected" : ""}`} key={candidate.candidate_id} onClick={() => void selectCandidate(candidate)}><span><strong>{candidate.candidate_name}</strong><small>{candidate.email}</small></span><em>{candidate.answer_count}</em></button>)}</div>)}{!loading && !candidates.length && <p className="muted">No candidates available.</p>}</aside><section className="review-panel">{selected ? <><div className="review-heading"><div><p className="eyebrow">{selected.role}</p><h1>{selected.candidate_name}</h1><p className="muted">{selected.email}</p></div><span className="tag">{answers.length} answers</span></div>{answers.length ? answers.map((answer) => <AnswerCard key={answer.answer_id} answer={answer} email={email} onChange={() => void selectCandidate(selected)} />) : <div className="card empty-card"><p className="muted">No submitted answers yet.</p></div>}</> : <div className="blank-review"><div className="brand-mark">→</div><h2>Select a candidate</h2><p className="muted">Choose a candidate from the review queue to see their submitted answers.</p></div>}</section></div></main>;
}

function AnswerCard({ answer, email, onChange }: { answer: Answer; email: string; onChange: () => void }) {
  const [score, setScore] = useState(String(answer.effective_score ?? answer.suggested_score ?? ""));
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!answer.audio_url) return;
    let active = true;
    let objectUrl: string | null = null;
    void fetch(`${API_URL}${answer.audio_url}`, { headers: { "X-Mock-HR-Email": email } })
      .then((response) => {
        if (!response.ok) throw new Error("Audio response unavailable.");
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setAudioSrc(objectUrl);
      })
      .catch(() => setAudioSrc(null));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [answer.audio_url, email]);
  async function override(event: FormEvent) { event.preventDefault(); if (!reason.trim() || !score) return; setBusy(true); setMessage(""); try { await api.override(email, answer.answer_id, Number(score), reason.trim()); setReason(""); setMessage("Override saved."); onChange(); } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save override."); } finally { setBusy(false); } }
  async function retry() { setBusy(true); setMessage(""); try { await api.retry(email, answer.answer_id); setMessage("Retry queued."); onChange(); } catch (err) { setMessage(err instanceof Error ? err.message : "Could not retry scoring."); } finally { setBusy(false); } }
  const status = answer.scoring_status;
  return <article className="card answer-card"><div className="answer-top"><span className="question-number">Question</span><span className={`status status-${status || "queued"}`}>{status === "needs_human" ? "Needs human" : status || "Queued"}</span></div><h3>{answer.question}</h3>{answer.answer_text ? <p className="answer-text">{answer.answer_text}</p> : audioSrc ? <audio controls src={audioSrc}>Audio response</audio> : <p className="muted">Loading audio response...</p>}<div className="score-summary"><div><span className="muted">Suggested score</span><strong>{answer.suggested_score ?? "—"}<small>/4</small></strong></div><div><span className="muted">Reason</span><p>{answer.suggested_reason || "No suggested score yet."}</p></div></div>{status === "failed" && <button className="secondary-button retry-button" onClick={retry} disabled={busy}>Retry failed scoring</button>}{status !== "failed" && status !== "needs_human" && <form className="override-form" onSubmit={override}><label>Override score<select value={score} onChange={(e) => setScore(e.target.value)}><option value="">Select</option><option value="1">1 — Does not meet</option><option value="2">2 — Developing</option><option value="3">3 — Meets</option><option value="4">4 — Strong</option></select></label><label>Reason (required)<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain your override" required /></label><button disabled={busy || !reason.trim() || !score}>{busy ? "Saving..." : "Save override"}</button></form>}{message && <p className="form-message">{message}</p>}</article>;
}
