/*
  # Create Cataract Detection System Tables

  1. New Tables
    - `detections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `prediction` (text) - 'cataract' or 'normal'
      - `confidence` (float) - prediction confidence score
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on `detections` table
    - Users can only view their own detection records
    - Users can create new detection records
*/

CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  prediction text NOT NULL CHECK (prediction IN ('cataract', 'normal')),
  confidence float NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own detections"
  ON detections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own detections"
  ON detections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own detections"
  ON detections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_detections_user_id ON detections(user_id);
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at DESC);