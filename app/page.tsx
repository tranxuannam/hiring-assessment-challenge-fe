"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  function openAssessment(event: FormEvent) {
    event.preventDefault();
    if (token.trim()) router.push(`/candidate/${encodeURIComponent(token.trim())}`);
  }

  return (
    <main className="shell landing">
      <div className="brand-mark">H</div>
      <p className="eyebrow">Hiring assessment workspace</p>
      <h1>Make every answer count.</h1>
      <p className="lede">Choose your workspace to continue.</p>
      <div className="entry-grid">
        <section className="card entry-card">
          <span className="tag candidate-tag">Candidate</span>
          <h2>Take your assessment</h2>
          <p>Use the personal link shared with you to continue where you left off.</p>
          <form onSubmit={openAssessment}>
            <label htmlFor="token">Personal assessment token</label>
            <input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your token" required />
            <button type="submit">Open assessment</button>
          </form>
        </section>
        <section className="card entry-card">
          <span className="tag hr-tag">HR workspace</span>
          <h2>Review candidates</h2>
          <p>Sign in with the clearly labelled demo HR access to review submitted answers.</p>
          <button className="secondary-button" onClick={() => router.push("/hr")}>Open HR workspace</button>
        </section>
      </div>
    </main>
  );
}
