/*
  # Question Papers Schema

  1. New Tables
    - `question_papers`
      - `id` (uuid, primary key) - Unique identifier for each question paper
      - `topic` (text) - The subject/topic of the question paper
      - `difficulty` (text) - Difficulty level (easy, medium, hard)
      - `questions` (jsonb) - Array of generated questions with answers
      - `created_at` (timestamptz) - Timestamp when the paper was generated
  
  2. Security
    - Enable RLS on `question_papers` table
    - Add policy for public access to read question papers
    - Add policy for public access to insert question papers
*/

CREATE TABLE IF NOT EXISTS question_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view question papers"
  ON question_papers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create question papers"
  ON question_papers FOR INSERT
  WITH CHECK (true);