export interface Habit {
  id: string
  name: string
  description?: string
  color: string
  category?: string
  frequency: "daily" | "weekly" | "monthly"
  targetDays?: number[] // For weekly habits: [0,1,2,3,4,5,6] where 0=Sunday
  createdAt: Date
  isActive: boolean
}

export interface HabitEntry {
  id: string
  habitId: string
  date: string // YYYY-MM-DD format
  completed: boolean
  notes?: string
  completedAt?: Date
}

export interface HabitStats {
  habitId: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  completionRate: number // percentage
  weeklyStats: { week: string; completions: number }[]
  monthlyStats: { month: string; completions: number }[]
}
