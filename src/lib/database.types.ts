export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          name: string
          email: string | null
          avatar_color: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          avatar_color?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          avatar_color?: string
          is_active?: boolean
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          sort_order: number
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          sort_order?: number
          is_archived?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          sort_order?: number
          is_archived?: boolean
        }
        Relationships: []
      }
      sections: {
        Row: {
          id: string
          project_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          section_id: string | null
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          assignee_id: string | null
          due_date: string | null
          completed_at: string | null
          waiting_on_id: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          section_id?: string | null
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assignee_id?: string | null
          waiting_on_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          project_id?: string
          section_id?: string | null
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assignee_id?: string | null
          waiting_on_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold'
export type TaskPriority = 'high' | 'medium' | 'low'

export type Member = Database['public']['Tables']['members']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
