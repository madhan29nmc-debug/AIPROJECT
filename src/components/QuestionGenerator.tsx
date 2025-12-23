import { useState } from 'react';
import { FileText, Download, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { exportToPDF } from '../utils/pdfExport';
import type { Question, QuestionPaper, Difficulty } from '../types';

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<QuestionPaper | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const { questions } = await response.json();

      const { data, error: dbError } = await supabase
        .from('question_papers')
        .insert({
          topic,
          difficulty,
          questions,
        })
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      setGeneratedPaper(data as QuestionPaper);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (generatedPaper) {
      exportToPDF(generatedPaper);
    }
  };

  const getTotalMarks = (questions: Question[]) => {
    return questions.reduce((sum, q) => sum + q.marks, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI Question Paper Generator
            </h1>
            <p className="text-lg text-gray-600">
              Generate comprehensive question papers instantly with AI
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic / Subject
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning, React Hooks, Data Structures"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        difficulty === level
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Question Paper
                  </>
                )}
              </button>
            </div>
          </div>

          {generatedPaper && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {generatedPaper.topic}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium">
                      Difficulty: <span className="text-blue-600">{generatedPaper.difficulty.toUpperCase()}</span>
                    </span>
                    <span>|</span>
                    <span>
                      Total Marks: <span className="font-bold text-gray-900">{getTotalMarks(generatedPaper.questions)}</span>
                    </span>
                    <span>|</span>
                    <span>
                      Questions: <span className="font-bold text-gray-900">{generatedPaper.questions.length}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
              </div>

              <div className="space-y-6">
                {generatedPaper.questions.map((question, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-blue-600 text-lg">Q{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {question.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mb-3">{question.question}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-start gap-2 text-gray-700">
                                <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span>
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
