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

export type BudgetEntryType = "income" | "expense";

export type BudgetEntry = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: BudgetEntryType;
  category: string;
  entry_date: string;
  created_at: string;
};

export type BudgetSettings = {
  user_id: string;
  monthly_budget: number;
  currency_code: string;
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

export type BudgetEntryInsert = {
  id?: string;
  user_id: string;
  title: string;
  amount: number;
  type: BudgetEntryType;
  category: string;
  entry_date?: string;
  created_at?: string;
};

export type BudgetEntryUpdate = Partial<Omit<BudgetEntryInsert, "user_id">>;

export type BudgetSettingsInsert = {
  user_id: string;
  monthly_budget?: number;
  currency_code?: string;
  created_at?: string;
  updated_at?: string;
};

export type BudgetSettingsUpdate = Partial<Omit<BudgetSettingsInsert, "user_id" | "created_at">>;

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
      budget_entries: {
        Row: BudgetEntry;
        Insert: BudgetEntryInsert;
        Update: BudgetEntryUpdate;
        Relationships: [];
      };
      budget_settings: {
        Row: BudgetSettings;
        Insert: BudgetSettingsInsert;
        Update: BudgetSettingsUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_priority: TaskPriority;
      budget_entry_type: BudgetEntryType;
    };
    CompositeTypes: Record<string, never>;
  };
};
