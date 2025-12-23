import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  topic: string;
  difficulty: string;
}

interface Question {
  question: string;
  options?: string[];
  answer: string;
  type: "mcq" | "short" | "long";
  marks: number;
}

function generateQuestions(topic: string, difficulty: string): Question[] {
  const questionCount = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
  const questions: Question[] = [];
  
  const questionTemplates = {
    mcq: [
      `What is the primary concept of ${topic}?`,
      `Which of the following best describes ${topic}?`,
      `In the context of ${topic}, what is most important?`,
      `How does ${topic} relate to modern applications?`,
      `What are the key principles of ${topic}?`,
    ],
    short: [
      `Explain the basic concept of ${topic}.`,
      `Describe the importance of ${topic} in practical applications.`,
      `What are the main characteristics of ${topic}?`,
      `How would you implement ${topic} in a real-world scenario?`,
      `Compare and contrast different approaches to ${topic}.`,
    ],
    long: [
      `Discuss in detail the theoretical foundations and practical applications of ${topic}.`,
      `Analyze the evolution and future prospects of ${topic}.`,
      `Critically evaluate the advantages and limitations of ${topic}.`,
      `Provide a comprehensive overview of ${topic} with relevant examples.`,
    ],
  };

  const difficultyMarks = {
    easy: { mcq: 1, short: 3, long: 5 },
    medium: { mcq: 2, short: 5, long: 10 },
    hard: { mcq: 2, short: 7, long: 15 },
  };

  const marks = difficultyMarks[difficulty as keyof typeof difficultyMarks] || difficultyMarks.medium;

  for (let i = 0; i < questionCount; i++) {
    let type: "mcq" | "short" | "long";
    
    if (i < questionCount * 0.6) {
      type = "mcq";
    } else if (i < questionCount * 0.85) {
      type = "short";
    } else {
      type = "long";
    }

    const templates = questionTemplates[type];
    const questionText = templates[Math.floor(Math.random() * templates.length)];

    const question: Question = {
      question: questionText,
      type,
      marks: marks[type],
      answer: type === "mcq" ? "Option A" : `Sample answer for ${topic} question.`,
    };

    if (type === "mcq") {
      question.options = [
        `Fundamental principle of ${topic}`,
        `Alternative approach to ${topic}`,
        `Common misconception about ${topic}`,
        `Advanced technique in ${topic}`,
      ];
    }

    questions.push(question);
  }

  return questions;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { topic, difficulty }: GenerateRequest = await req.json();

    if (!topic || !difficulty) {
      return new Response(
        JSON.stringify({ error: "Topic and difficulty are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const questions = generateQuestions(topic, difficulty);

    return new Response(
      JSON.stringify({ questions }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});