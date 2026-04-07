export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  completed: boolean;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  tags: string[] | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  timezone: string | null;
  country_code: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskInsert = {
  id?: string;
  user_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  completed?: boolean;
  created_at?: string;
};

export type TaskUpdate = Partial<Omit<TaskInsert, "user_id">>;

export type NoteInsert = {
  id?: string;
  user_id: string;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  created_at?: string;
};

export type NoteUpdate = Partial<Omit<NoteInsert, "user_id">>;

export type ProfileInsert = {
  id: string;
  email: string;
  full_name?: string | null;
  timezone?: string | null;
  country_code?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<ProfileInsert, "id" | "email" | "created_at">>;

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
        Relationships: [];
      };
      notes: {
        Row: Note;
        Insert: NoteInsert;
        Update: NoteUpdate;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_priority: TaskPriority;
    };
    CompositeTypes: Record<string, never>;
  };
};
