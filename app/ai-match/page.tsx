"use client";
import { useState } from "react";

type Therapist = {
  id: string;
  name: string;
  specialties: string[];
  languages: string[];
  price_inr: number | null;
  bio: string | null;
};

export default function AiMatchPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<Therapist[]>([]);
  const [error, setError] = useState("");

  async function search() {
    setLoading(true);
    setError("");
    setSummary("");
    setResults([]);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSummary(data.summary);
      setResults(data.therapists);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">AI therapist match</h1>
      <p className="mt-2 text-gray-600">
        Tell us what you&apos;re looking for, in your own words. Please don&apos;t enter personal details.
      </p>
      <textarea
        className="mt-4 w-full rounded-xl border p-3"
        rows={4}
        maxLength={500}
        placeholder="e.g. I feel anxious about work and prefer someone who speaks Hindi"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={search}
        disabled={loading || !message.trim()}
        className="mt-3 rounded-full bg-blue-700 px-6 py-2 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Searching..." : "Find my therapist"}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {summary && <p className="mt-6 italic">{summary}</p>}
      <div className="mt-4 space-y-3">
        {results.map((t) => (
          <div key={t.id} className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">{t.name}</h2>
            <p className="text-sm text-gray-600">
              {t.specialties.join(", ")} · {t.languages.join(", ")}
            </p>
            {t.price_inr && <p className="text-sm">₹{t.price_inr} / session</p>}
            {t.bio && <p className="mt-1 text-sm">{t.bio}</p>}
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-gray-500">
        This tool only suggests therapists. It is not medical advice. If you are in crisis, contact a local emergency service or helpline.
      </p>
    </main>
  );
}