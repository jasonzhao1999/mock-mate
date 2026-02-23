"use client";

import { useState } from "react";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";

interface Question {
  question: string;
  answer: string;
  difficulty: string;
  followUp: string;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (params: {
    role: string;
    level: string;
    topic: string;
    count: number;
  }) => {
    setIsLoading(true);
    setError("");
    setQuestions([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setQuestions(data.questions);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MockMateAI
          </h1>
          <p className="text-gray-500">
            Generate tailored interview questions for any role in seconds.
            Powered by AI.
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl mb-8">
          <QuestionForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <QuestionList questions={questions} />
      </div>
    </main>
  );
}
