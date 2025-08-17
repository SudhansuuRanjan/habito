"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, Flame, Target, Award, Clock } from "lucide-react"
import type { Habit } from "@/lib/types"
import { getHabits, getEntries } from "@/lib/storage"
import { calculateHabitStats } from "@/lib/analytics"

export function AnalyticsDashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    setHabits(getHabits())
  }, [])

  const getIndividualHabitStats = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return null

    const stats = calculateHabitStats(habit)
    const entries = getEntries().filter((e) => e.habitId === habitId)
    const completedEntries = entries.filter((e) => e.completed)

    return {
      habit,
      stats,
      totalEntries: entries.length,
      completedEntries: completedEntries.length,
      completionRate: stats.completionRate,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCompletions: stats.totalCompletions,
    }
  }

  const getOverallStats = () => {
    if (selectedHabit !== "all") {
      const habitStats = getIndividualHabitStats(selectedHabit)
      if (!habitStats)
        return { totalHabits: 0, totalCompletions: 0, averageCompletion: 0, bestStreak: 0, activeStreaks: 0 }

      return {
        totalHabits: 1,
        totalCompletions: habitStats.completedEntries,
        averageCompletion: habitStats.completionRate,
        bestStreak: habitStats.longestStreak,
        activeStreaks: habitStats.currentStreak > 0 ? 1 : 0,
      }
    }

    const entries = getEntries()
    const completedEntries = entries.filter((e) => e.completed)

    const activeHabits = habits.filter((h) => h.isActive)
    let totalCompletionRate = 0
    let habitsWithEntries = 0

    activeHabits.forEach((habit) => {
      const habitStats = calculateHabitStats(habit)
      if (habitStats.totalCompletions > 0 || entries.some((e) => e.habitId === habit.id)) {
        totalCompletionRate += habitStats.completionRate
        habitsWithEntries++
      }
    })

    const averageCompletion = habitsWithEntries > 0 ? Math.round(totalCompletionRate / habitsWithEntries) : 0

    const streaks = habits.map((habit) => calculateHabitStats(habit).currentStreak)
    const longestStreaks = habits.map((habit) => calculateHabitStats(habit).longestStreak)

    return {
      totalHabits: activeHabits.length,
      totalCompletions: completedEntries.length,
      averageCompletion,
      bestStreak: Math.max(...longestStreaks, 0),
      activeStreaks: streaks.filter((s) => s > 0).length,
    }
  }

  const getConsistencyData = () => {
    const entries = getEntries()
    const now = new Date()
    const data = []

    let daysBack = 30
    if (timeRange === "week") daysBack = 7
    if (timeRange === "year") daysBack = 365

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      let dayEntries = entries.filter((e) => e.date === dateStr)
      if (selectedHabit !== "all") {
        dayEntries = dayEntries.filter((e) => e.habitId === selectedHabit)
      }

      const completedCount = dayEntries.filter((e) => e.completed).length
      const totalCount = dayEntries.length

      let label = ""
      if (timeRange === "week") {
        label = date.toLocaleDateString("en-US", { weekday: "short" })
      } else if (timeRange === "month") {
        label = date.getDate().toString()
      } else {
        label = date.toLocaleDateString("en-US", { month: "short" })
      }

      data.push({
        date: dateStr,
        label,
        completed: completedCount,
        total: totalCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      })
    }

    return data
  }

  const getHabitPerformance = () => {
    if (selectedHabit !== "all") {
      const habitStats = getIndividualHabitStats(selectedHabit)
      if (!habitStats) return []

      return [
        {
          name: habitStats.habit.name,
          color: habitStats.habit.color,
          completionRate: habitStats.stats.completionRate,
          currentStreak: habitStats.stats.currentStreak,
          longestStreak: habitStats.stats.longestStreak,
          totalCompletions: habitStats.stats.totalCompletions,
        },
      ]
    }

    return habits.map((habit) => {
      const stats = calculateHabitStats(habit)
      return {
        name: habit.name,
        color: habit.color,
        completionRate: stats.completionRate,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalCompletions: stats.totalCompletions,
      }
    })
  }

  const getHeatmapData = () => {
    const entries = getEntries()
    const now = new Date()
    const data = []

    for (let week = 11; week >= 0; week--) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(now)
        date.setDate(date.getDate() - week * 7 - (6 - day))
        const dateStr = date.toISOString().split("T")[0]

        let dayEntries = entries.filter((e) => e.date === dateStr)
        if (selectedHabit !== "all") {
          dayEntries = dayEntries.filter((e) => e.habitId === selectedHabit)
        }

        const completedCount = dayEntries.filter((e) => e.completed).length
        const totalCount = dayEntries.length

        weekData.push({
          date: dateStr,
          day: date.getDate(),
          completed: completedCount,
          total: totalCount,
          intensity: totalCount > 0 ? completedCount / totalCount : 0,
        })
      }
      data.push(weekData)
    }

    return data
  }

  const overallStats = getOverallStats()
  const consistencyData = getConsistencyData()
  const habitPerformance = getHabitPerformance()
  const heatmapData = getHeatmapData()

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-1))",
    },
    percentage: {
      label: "Completion %",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex gap-4 flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {selectedHabit === "all"
              ? "Track your habit consistency and progress"
              : `Analytics for ${habits.find((h) => h.id === selectedHabit)?.name || "Selected Habit"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedHabit} onValueChange={setSelectedHabit}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select habit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Habits</SelectItem>
              {habits
                .filter((h) => h.isActive)
                .map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${habit.color}`} />
                      {habit.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(value: "week" | "month" | "year") => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="size-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalHabits}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedHabit === "all" ? "Active Habits" : "Selected Habit"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Award className="size-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalCompletions}</p>
                <p className="text-sm text-muted-foreground">Total Completions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{overallStats.averageCompletion}%</p>
                <p className="text-sm text-muted-foreground">
                  {selectedHabit === "all" ? "Avg Completion" : "Completion Rate"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Flame className="size-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{overallStats.bestStreak}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedHabit === "all" ? "Best Streak" : "Longest Streak"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="size-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{overallStats.activeStreaks}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedHabit === "all" ? "Active Streaks" : "Current Streak"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consistency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="performance">{selectedHabit === "all" ? "Performance" : "Details"}</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedHabit === "all" ? "Overall Consistency Trend" : "Habit Consistency Trend"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consistencyData}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#008000"
                      strokeWidth={2}
                      dot={{ fill: "#008000" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consistencyData}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="#008000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedHabit === "all" ? "Habit Performance" : "Habit Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habitPerformance.map((habit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {habit.completionRate}% completion
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Flame className="w-3 h-3 mr-1" />
                            {habit.currentStreak} current
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {habit.longestStreak} best
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{habit.totalCompletions}</p>
                      <p className="text-sm text-muted-foreground">completions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedHabit === "all"
                  ? "Activity Heatmap (Last 12 Weeks)"
                  : `${habits.find((h) => h.id === selectedHabit)?.name || "Habit"} Activity (Last 12 Weeks)`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex text-xs text-muted-foreground mb-2">
                  <div className="w-8"></div>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="w-4 text-center">
                      {day[0]}
                    </div>
                  ))}
                </div>
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex items-center gap-1">
                    <div className="w-8 text-xs text-muted-foreground">
                      {weekIndex % 4 === 0 ? `W${12 - weekIndex}` : ""}
                    </div>
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-4 h-4 rounded-sm border ${
                          day.intensity === 0
                            ? "bg-muted"
                            : day.intensity < 0.3
                              ? "bg-green-200 dark:bg-green-900"
                              : day.intensity < 0.7
                                ? "bg-green-400 dark:bg-green-700"
                                : "bg-green-600 dark:bg-green-500"
                        }`}
                        title={`${day.date}: ${day.completed}/${day.total} habits completed`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted border" />
                  <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900 border" />
                  <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700 border" />
                  <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500 border" />
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
