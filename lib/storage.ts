// localStorage keys
const HABITS_KEY = "habits"
const ENTRIES_KEY = "habit-entries"

// Helper functions for localStorage
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

// Habit CRUD operations
export const getHabits = (): Habit[] => {
  return getFromStorage<Habit>(HABITS_KEY)
}

export const saveHabit = (habit: Habit): Habit => {
  const habits = getHabits()
  const { id, ...habitData } = habit

  if (id && id !== "temp") {
    // Update existing habit\
    const index = habits.findIndex((h) => h.id === id)
    if (index !== -1) {
      habits[index] = { ...habits[index], ...habitData }
      saveToStorage(HABITS_KEY, habits)
      return habits[index]
    }
  }
  
  // Create new habit
  const newHabit: Habit = {
    id: generateId(),
    ...habitData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  habits.unshift(newHabit)
  saveToStorage(HABITS_KEY, habits)
  return newHabit
}

export const deleteHabit = (habitId: string): void => {
  const habits = getHabits().filter((h) => h.id !== habitId)
  const entries = getEntries().filter((e) => e.habitId !== habitId)
  saveToStorage(HABITS_KEY, habits)
  saveToStorage(ENTRIES_KEY, entries)
}

// Entry CRUD operations
export const getEntries = (): HabitEntry[] => {
  return getFromStorage<HabitEntry>(ENTRIES_KEY)
}

export const getEntriesForHabit = (habitId: string): HabitEntry[] => {
  return getEntries().filter((e) => e.habitId === habitId)
}

export const getEntriesForDate = (date: string): HabitEntry[] => {
  return getEntries().filter((e) => e.date === date)
}

export const saveEntry = (entry: HabitEntry): HabitEntry => {
  const entries = getEntries()
  const { id, ...entryData } = entry

  if (id && !id.includes("temp")) {
    // Update existing entry\
    const index = entries.findIndex((e) => e.id === id)
    if (index !== -1) {
      entries[index] = { ...entries[index], ...entryData }
      saveToStorage(ENTRIES_KEY, entries)
      return entries[index]
    }
  }

  // Create new entry
  const newEntry: HabitEntry = {
    id: generateId(),
    ...entryData,
    createdAt: new Date(),
  }
  entries.push(newEntry)
  saveToStorage(ENTRIES_KEY, entries)
  return newEntry
}

export const toggleHabitCompletion = (habitId: string, date: string): HabitEntry => {
  const entries = getEntries()
  const existingEntry = entries.find((e) => e.habitId === habitId && e.date === date)

  if (existingEntry) {
    // Toggle existing entry
    existingEntry.completed = !existingEntry.completed
    existingEntry.completedAt = existingEntry.completed ? new Date() : null
    saveToStorage(ENTRIES_KEY, entries)
    return existingEntry
  } else {
    // Create new completed entry\
    const newEntry: HabitEntry = {
      id: generateId(),
      habitId,
      date,
      completed: true,
      completedAt: new Date(),
      createdAt: new Date(),
    }
    entries.push(newEntry)
    saveToStorage(ENTRIES_KEY, entries)
    return newEntry
  }
}

export const getHabitsWithEntries = (date?: string): (Habit & { entries: HabitEntry[] })[] => {
  const habits = getHabits()
  const allEntries = getEntries()

  return habits.map((habit) => ({
    ...habit,
    entries: date 
      ? allEntries.filter((e) => e.habitId === habit.id && e.date === date)
      : allEntries.filter((e) => e.habitId === habit.id),
  }))
}

export const getHabitWithEntries = (habitId: string): (Habit & { entries: HabitEntry[] }) | null => {
  const habit = getHabits().find((h) => h.id === habitId)
  if (!habit) return null

  const entries = getEntries().filter((e) => e.habitId === habitId)
  return { ...habit, entries }
}

// Utility functions remain the same
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

export const getTodayString = (): string => {
  return formatDate(new Date())
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
