export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          body_weight: number | null
          preferred_unit: 'kg' | 'lbs' | null
          updated_at?: string
        }
        Insert: {
          id: string
          username?: string | null
          body_weight?: number | null
          preferred_unit?: 'kg' | 'lbs' | null
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          body_weight?: number | null
          preferred_unit?: 'kg' | 'lbs' | null
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          external_api_id: string | null
          name: string
          body_part: string
          gif_url: string | null
          current_pr: number | null
        }
        Insert: {
          id?: string
          user_id: string
          external_api_id?: string | null
          name: string
          body_part: string
          gif_url?: string | null
          current_pr?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          external_api_id?: string | null
          name?: string
          body_part?: string
          gif_url?: string | null
          current_pr?: number | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          status: 'planned' | 'in_progress' | 'completed'
          start_time: string | null
          scheduled_date: string | null
          end_time: string | null
          volume_load: number | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          status?: 'planned' | 'in_progress' | 'completed'
          start_time?: string | null
          scheduled_date?: string | null
          end_time?: string | null
          volume_load?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          status?: 'planned' | 'in_progress' | 'completed'
          start_time?: string | null
          scheduled_date?: string | null
          end_time?: string | null
          volume_load?: number | null
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          created_at?: string
        }
      }
      sets: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          reps: number
          weight: number
          rpe: number | null
          estimated_1rm: number | null
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          reps: number
          weight: number
          rpe?: number | null
          estimated_1rm?: number | null
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          reps?: number
          weight?: number
          rpe?: number | null
          estimated_1rm?: number | null
        }
      }
      workout_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      template_exercises: {
        Row: {
          id: string
          template_id: string
          exercise_id: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          exercise_id: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          exercise_id?: string
          order?: number
          created_at?: string
        }
      }
    }
  }
}
