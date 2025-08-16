"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Clock, Flame, Target, TrendingUp, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import type { Habit, HabitEntry } from "@/lib/types"
import { getHabits, getEntries, toggleHabitCompletion, getTodayString } from "@/lib/storage"
import { getTodaysHabits, calculateHabitStats } from "@/lib/analytics"
import { EmptyState } from "./empty-state"
import { LoadingSpinner } from "./loading-spinner"

export function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [entries, setEntries] = useState<HabitEntry[]>([])
  const [todaysHabits, setTodaysHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 300))

      const allHabits = getHabits()
      const allEntries = getEntries()
      const todayHabits = getTodaysHabits(allHabits)

      setHabits(allHabits)
      setEntries(allEntries)
      setTodaysHabits(todayHabits)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleHabitToggle = (habitId: string) => {
    toggleHabitCompletion(habitId, getTodayString())
    setEntries(getEntries())
  }

  const isHabitCompleted = (habitId: string): boolean => {
    const today = getTodayString()
    const entry = entries.find((e) => e.habitId === habitId && e.date === today)
    return entry?.completed ?? false
  }

  const getTodayStats = () => {
    const completed = todaysHabits.filter((habit) => isHabitCompleted(habit.id)).length
    const total = todaysHabits.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }

  const getStreakStats = () => {
    const streaks = habits.map((habit) => calculateHabitStats(habit).currentStreak)
    const maxStreak = Math.max(...streaks, 0)
    const avgStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0

    return { maxStreak, avgStreak }
  }

  const getWeeklyProgress = () => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      const dayHabits = getTodaysHabits(habits) // This would need to be adjusted for each day
      const completedCount = entries.filter(
        (e) => e.date === dateStr && e.completed && dayHabits.some((h) => h.id === e.habitId),
      ).length

      weekDays.push({
        date: date,
        completed: completedCount,
        total: dayHabits.length,
      })
    }

    return weekDays
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  const todayStats = getTodayStats()
  const streakStats = getStreakStats()
  const weeklyProgress = getWeeklyProgress()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getMotivationalMessage = () => {
    const { completed, total, percentage } = todayStats

    if (percentage === 100) {
      return "Amazing! You've completed all your habits today!"
    } else if (percentage >= 75) {
      return "Great progress! You're almost there!"
    } else if (percentage >= 50) {
      return "Good work! Keep the momentum going!"
    } else if (percentage > 0) {
      return "Nice start! Every habit counts!"
    } else {
      return "Ready to build some great habits today?"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          {getGreeting()}!
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">{getMotivationalMessage()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            value: `${todayStats.completed}/${todayStats.total}`,
            label: "Today's Progress",
            color: "text-primary",
          },
          { icon: Flame, value: streakStats.maxStreak, label: "Best Streak", color: "text-orange-500" },
          { icon: TrendingUp, value: `${todayStats.percentage}%`, label: "Completion Rate", color: "text-green-500" },
          {
            icon: Clock,
            value: habits.filter((h) => h.isActive).length,
            label: "Active Habits",
            color: "text-blue-500",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className="transition-all duration-200 hover:shadow-md hover:scale-105 animate-in slide-in-from-bottom-5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6 py-2">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="animate-in slide-in-from-left-5 duration-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Today's Progress
            <Badge variant={todayStats.percentage === 100 ? "default" : "secondary"} className="transition-colors">
              {todayStats.percentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={todayStats.percentage} className="mb-4 transition-all duration-500" />
          <p className="text-sm text-muted-foreground">
            {todayStats.completed} of {todayStats.total} habits completed
          </p>
        </CardContent>
      </Card>

      <Card className="animate-in slide-in-from-right-5 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Habits</CardTitle>
            <Button asChild size="sm" className="transition-all duration-200 hover:scale-105">
              <Link href="/habits">
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todaysHabits.length === 0 ? (
            <EmptyState
              title="No habits scheduled for today"
              description="Create your first habit to start building consistency and tracking your progress."
              actionLabel="Create Your First Habit"
              actionHref="/habits"
              icon={<Target className="w-12 h-12" />}
            />
          ) : (
            <div className="space-y-3">
              {todaysHabits.map((habit, index) => {
                const isCompleted = isHabitCompleted(habit.id)
                const stats = calculateHabitStats(habit)

                return (
                  <div
                    key={habit.id}
                    className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border rounded-lg transition-all duration-300 hover:shadow-sm animate-in slide-in-from-left-5 ${
                      isCompleted
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "hover:bg-accent/50"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${habit.color} shadow-sm`} />
                      <div>
                        <p
                          className={`font-medium transition-all duration-200 ${isCompleted ? "line-through text-muted-foreground" : ""}`}
                        >
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {habit.category && (
                            <Badge variant="outline" className="text-xs">
                              {habit.category}
                            </Badge>
                          )}
                          {stats.currentStreak > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Flame className="w-3 h-3 mr-1" />
                              {stats.currentStreak} day streak
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleHabitToggle(habit.id)}
                      className={`transition-all duration-200 hover:scale-105 ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Done
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyProgress.map((day, index) => {
              const dayName = day.date.toLocaleDateString("en-US", { weekday: "short" })
              const isToday = day.date.toDateString() === new Date().toDateString()
              const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0

              return (
                <div key={index} className="text-center">
                  <p className={`text-xs font-medium mb-2 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {dayName}
                  </p>
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                      percentage === 100
                        ? "bg-green-500 text-white"
                        : percentage > 0
                          ? "bg-yellow-500 text-white"
                          : "bg-muted text-muted-foreground"
                    } ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  >
                    {day.completed}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/calendar", icon: Calendar, label: "View Calendar" },
          { href: "/habits", icon: Target, label: "Manage Habits" },
          { href: "/analytics", icon: TrendingUp, label: "View Analytics" },
        ].map((action, index) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="h-auto p-6 bg-transparent transition-all duration-200 hover:shadow-md hover:scale-105 animate-in slide-in-from-bottom-5"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <Link href={action.href} className="flex flex-col items-center gap-3">
              <action.icon className="w-8 h-8" />
              <span className="font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
