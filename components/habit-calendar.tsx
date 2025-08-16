"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import type { Habit, HabitEntry } from "@/lib/types"
import { getHabits, getEntries, toggleHabitCompletion, formatDate } from "@/lib/storage"

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  habits: Habit[]
  entries: HabitEntry[]
}

export function HabitCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habits, setHabits] = useState<Habit[]>([])
  const [entries, setEntries] = useState<HabitEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  // Week view state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return start;
  });

  useEffect(() => {
    setHabits(getHabits())
    setEntries(getEntries())
  }, [])

  // Helper: get habits for a date
  const getHabitsForDate = (date: Date): Habit[] => {
    const dayOfWeek = date.getDay()
    const dayOfMonth = date.getDate()
    return habits.filter((habit) => {
      if (!habit.isActive) return false
      switch (habit.frequency) {
        case "daily":
          return true
        case "weekly":
          return habit.targetDays?.includes(dayOfWeek) ?? false
        case "monthly":
          return dayOfMonth === 1
        default:
          return false
      }
    })
  }

  // Helper: is habit completed
  const isHabitCompleted = (habitId: string, date: Date): boolean => {
    const dateStr = formatDate(date)
    const entry = entries.find((e) => e.habitId === habitId && e.date === dateStr)
    return entry?.completed ?? false
  }

  // Helper: handle habit toggle
  const handleHabitToggle = (habitId: string, date: Date) => {
    const today = new Date()
    const isToday = formatDate(date) === formatDate(today)
    if (!isToday) return
    const dateStr = formatDate(date)
    toggleHabitCompletion(habitId, dateStr)
    setEntries(getEntries())
  }

  // Month helpers
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    const days: CalendarDay[] = []
    const currentDateObj = new Date(startDate)
    const today = new Date()
    while (currentDateObj <= endDate) {
      const dateStr = formatDate(currentDateObj)
      const dayHabits = getHabitsForDate(currentDateObj)
      const dayEntries = entries.filter((entry) => entry.date === dateStr)
      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: formatDate(currentDateObj) === formatDate(today),
        habits: dayHabits,
        entries: dayEntries,
      })
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    return days
  }

  // Week helpers
  const getDaysInWeek = (date: Date): CalendarDay[] => {
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + i);
      const dateStr = formatDate(d);
      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        isToday: formatDate(d) === formatDate(new Date()),
        habits: getHabitsForDate(d),
        entries: entries.filter((entry) => entry.date === dateStr),
      });
    }
    return days;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      return newDate
    })
  }

  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    setHabits(getHabits())
    setEntries(getEntries())
  }, [])

  return (
    <div className="space-y-6">
      {/* Month view for desktop/tablet */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{monthYear}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-1 border rounded-lg transition-colors ${day.isCurrentMonth ? "bg-background" : "bg-muted/30"
                    } ${day.isToday ? "ring-2 ring-primary cursor-pointer" : "cursor-default"} ${selectedDate && formatDate(selectedDate) === formatDate(day.date)
                      ? "bg-accent"
                      : day.isToday
                        ? "hover:bg-accent/50"
                        : ""
                    }`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                      }`}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.habits.slice(0, 3).map((habit) => {
                      const isCompleted = isHabitCompleted(habit.id, day.date)
                      return (
                        <div
                          key={habit.id}
                          className={`flex items-center gap-1 p-1 rounded text-xs ${isCompleted ? `${habit.color} text-white` : "bg-muted text-muted-foreground"
                            } ${day.isToday ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-60"}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (day.isToday) {
                              handleHabitToggle(habit.id, day.date)
                            }
                          }}
                        >
                          {isCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span className="truncate flex-1">{habit.name}</span>
                        </div>
                      )
                    })}
                    {day.habits.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">+{day.habits.length - 3} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Week view for mobile */}
      <div className="md:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Week of {currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(() => {
                  const now = new Date();
                  const start = new Date(now);
                  start.setDate(now.getDate() - now.getDay());
                  return start;
                })}>
                  This Week
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1">
              {getDaysInWeek(currentWeekStart).map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-1 border rounded-lg transition-colors ${day.isCurrentMonth ? "bg-background" : "bg-muted/30"
                    } ${day.isToday ? "ring-2 ring-primary cursor-pointer" : "cursor-default"} ${selectedDate && formatDate(selectedDate) === formatDate(day.date)
                      ? "bg-accent"
                      : day.isToday
                        ? "hover:bg-accent/50"
                        : ""
                    }`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div
                    className={`text-xs font-medium mb-1 ${day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                      }`}
                  >
                    {day.date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                  </div>
                  <div className="space-y-1">
                    {day.habits.slice(0, 2).map((habit) => {
                      const isCompleted = isHabitCompleted(habit.id, day.date)
                      return (
                        <div
                          key={habit.id}
                          className={`flex items-center gap-1 p-1 rounded text-xs ${isCompleted ? `${habit.color} text-white` : "bg-muted text-muted-foreground"
                            } ${day.isToday ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-60"}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (day.isToday) {
                              handleHabitToggle(habit.id, day.date)
                            }
                          }}
                        >
                          {isCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span className="truncate flex-1">{habit.name}</span>
                        </div>
                      )
                    })}
                    {day.habits.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">+{day.habits.length - 2} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Selected Date Details (shared) */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            {!(() => {
              const today = new Date()
              return formatDate(selectedDate) === formatDate(today)
            })() && (
                <p className="text-sm text-muted-foreground mt-2">
                  You can only mark habits for today. This date is view-only.
                </p>
              )}
          </CardHeader>
          <CardContent>
            {(() => {
              const dayHabits = getHabitsForDate(selectedDate)
              const today = new Date()
              const isSelectedDateToday = formatDate(selectedDate) === formatDate(today)
              if (dayHabits.length === 0) {
                return <p className="text-muted-foreground">No habits scheduled for this day.</p>
              }
              return (
                <div className="space-y-3">
                  {dayHabits.map((habit) => {
                    const isCompleted = isHabitCompleted(habit.id, selectedDate)
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${isSelectedDateToday ? "cursor-pointer hover:bg-accent/50" : "cursor-default opacity-60"
                          }`}
                        onClick={() => {
                          if (isSelectedDateToday) {
                            handleHabitToggle(habit.id, selectedDate)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                          <div>
                            <p className="font-medium">{habit.name}</p>
                            {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {habit.category && (
                            <Badge variant="outline" className="text-xs">
                              {habit.category}
                            </Badge>
                          )}
                          <Button
                            variant={isCompleted ? "default" : "outline"}
                            size="sm"
                            disabled={!isSelectedDateToday}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isSelectedDateToday) {
                                handleHabitToggle(habit.id, selectedDate)
                              }
                            }}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Completed
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                {isSelectedDateToday ? "Mark Complete" : "View Only"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}