"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Plus, Target } from "lucide-react"
import type { Habit } from "@/lib/types"
import { getHabits, deleteHabit } from "@/lib/storage"
import { HabitForm } from "./habit-form"
import { EmptyState } from "./empty-state"
import { LoadingSpinner } from "./loading-spinner"

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHabits = async () => {
      setIsLoading(true)
      // Simulate loading delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))
      setHabits(getHabits())
      setIsLoading(false)
    }
    loadHabits()
  }, [])

  const handleDelete = (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit? All tracking data will be lost.")) {
      deleteHabit(habitId)
      setHabits(getHabits())
    }
  }

  const handleSave = () => {
    setHabits(getHabits())
    setEditingHabit(null)
    setShowForm(false)
  }

  const getFrequencyText = (habit: Habit) => {
    switch (habit.frequency) {
      case "daily":
        return "Daily"
      case "weekly":
        if (habit.targetDays && habit.targetDays.length > 0) {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          return habit.targetDays.map((d) => days[d]).join(", ")
        }
        return "Weekly"
      case "monthly":
        return "Monthly"
      default:
        return habit.frequency
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (showForm || editingHabit) {
    return (
      <div className="animate-in slide-in-from-right-5 duration-300">
        <HabitForm
          habit={editingHabit || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingHabit(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">My Habits</h2>
          <p className="text-muted-foreground text-sm md:text-base">Build consistency with your daily routines</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          description="Create your first habit to start building consistency and tracking your progress."
          actionLabel="Create Your First Habit"
          actionHref="#"
          icon={<Target className="w-12 h-12" />}
        />
      ) : (
        <div className="grid gap-4">
          {habits.map((habit, index) => (
            <Card
              key={habit.id}
              className={`transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                !habit.isActive ? "opacity-60" : ""
              } animate-in slide-in-from-left-5`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${habit.color} shadow-sm`} />
                    <div>
                      <CardTitle className="text-lg">{habit.name}</CardTitle>
                      {habit.description && <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-accent">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(habit.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="transition-colors">
                    {getFrequencyText(habit)}
                  </Badge>
                  {habit.category && <Badge variant="outline">{habit.category}</Badge>}
                  {!habit.isActive && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
