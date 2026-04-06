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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_priority: TaskPriority;
    };
    CompositeTypes: Record<string, never>;
  };
};
