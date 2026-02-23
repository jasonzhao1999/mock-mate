"use client";

import { useState } from "react";

interface Question {
  question: string;
  answer: string;
  difficulty: string;
  followUp: string;
}

interface QuestionListProps {
  questions: Question[];
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export default function QuestionList({ questions }: QuestionListProps) {
  const [copied, setCopied] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (index: number) => {
    setShowAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopy = async () => {
    const text = questions
      .map(
        (q, i) =>
          `${i + 1}. ${q.question}\n   Answer: ${q.answer}\n   Difficulty: ${q.difficulty}\n   Follow-up: ${q.followUp}`
      )
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Generated Questions
        </h2>
        <button
          onClick={handleCopy}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {copied ? "Copied!" : "Copy all"}
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div
            key={i}
            className="p-4 border border-gray-200 rounded-lg animate-fade-in"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-gray-900 font-medium">
                <span className="text-gray-400 mr-2">{i + 1}.</span>
                {q.question}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  difficultyColor[q.difficulty] || "bg-gray-100 text-gray-600"
                }`}
              >
                {q.difficulty}
              </span>
            </div>

            {q.answer && (
              <div className="ml-6 mt-2">
                <button
                  onClick={() => toggleAnswer(i)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showAnswers[i] ? "Hide answer" : "Show answer"}
                </button>
                {showAnswers[i] && (
                  <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {q.answer}
                  </p>
                )}
              </div>
            )}

            {q.followUp && (
              <p className="text-sm text-gray-500 ml-6 mt-2">
                <span className="font-medium">Follow-up:</span> {q.followUp}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
