import type { Habit, HabitStats } from "./types"
import { getEntriesForHabit } from "./storage"

export const calculateHabitStats = (habit: Habit): HabitStats => {
  const entries = getEntriesForHabit(habit.id).filter((e) => e.completed)
  const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let currentStreak = 0
  const today = new Date()
  const checkDate = new Date(today)

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0]
    const hasEntry = entries.some((e) => e.date === dateStr)

    if (hasEntry) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  let longestStreak = 0
  let tempStreak = 0
  let lastDate: Date | null = null

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date)

    if (lastDate && entryDate.getTime() - lastDate.getTime() === 24 * 60 * 60 * 1000) {
      tempStreak++
    } else {
      tempStreak = 1
    }

    longestStreak = Math.max(longestStreak, tempStreak)
    lastDate = entryDate
  }

  const habitCreatedDate = new Date(habit.createdAt)
  const todayDate = new Date()

  // Calculate total days since habit was created
  const timeDiff = todayDate.getTime() - habitCreatedDate.getTime()
  const totalDaysSinceCreation = Math.ceil(timeDiff / (1000 * 3600 * 24))

  // For daily habits, every day counts. For weekly/monthly, calculate eligible days
  let eligibleDays = totalDaysSinceCreation

  if (habit.frequency === "weekly" && habit.targetDays) {
    // Count how many target days have occurred since creation
    eligibleDays = 0
    const currentDate = new Date(habitCreatedDate)
    while (currentDate <= todayDate) {
      if (habit.targetDays.includes(currentDate.getDay())) {
        eligibleDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (habit.frequency === "monthly") {
    // Count how many months have passed since creation
    const monthsDiff =
      (todayDate.getFullYear() - habitCreatedDate.getFullYear()) * 12 +
      (todayDate.getMonth() - habitCreatedDate.getMonth())
    eligibleDays = Math.max(1, monthsDiff + 1) // At least 1 if created this month
  }

  // Get all entries for this habit (not just completed ones)
  const allEntries = getEntriesForHabit(habit.id)
  const completedEntries = allEntries.filter((e) => e.completed)

  const completionRate = eligibleDays > 0 ? Math.round((completedEntries.length / eligibleDays) * 100) : 0

  const weeklyStats = []
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekEntries = entries.filter((e) => {
      const entryDate = new Date(e.date)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    weeklyStats.unshift({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      completions: weekEntries.length,
    })
  }

  const monthlyStats = []
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - i)

    const monthEntries = entries.filter((e) => {
      const entryDate = new Date(e.date)
      return entryDate.getMonth() === monthDate.getMonth() && entryDate.getFullYear() === monthDate.getFullYear()
    })

    monthlyStats.unshift({
      month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      completions: monthEntries.length,
    })
  }

  return {
    habitId: habit.id,
    currentStreak,
    longestStreak,
    totalCompletions: entries.length,
    completionRate,
    weeklyStats,
    monthlyStats,
  }
}

export const getTodaysHabits = (habits: Habit[]): Habit[] => {
  const today = new Date().getDay() // 0 = Sunday, 6 = Saturday

  return habits.filter((habit) => {
    if (!habit.isActive) return false

    switch (habit.frequency) {
      case "daily":
        return true
      case "weekly":
        return habit.targetDays?.includes(today) ?? false
      case "monthly":
        return new Date().getDate() === 1 // First day of month
      default:
        return false
    }
  })
}
