"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Habit } from "@/lib/types"
import { saveHabit, generateId } from "@/lib/storage"

interface HabitFormProps {
  habit?: Habit
  onSave?: (habit: Habit) => void
  onCancel?: () => void
}

const HABIT_COLORS = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Teal", value: "bg-teal-500" },
  { name: "Indigo", value: "bg-indigo-500" },
]

const CATEGORIES = [
  "Health & Fitness",
  "Learning",
  "Productivity",
  "Mindfulness",
  "Social",
  "Creative",
  "Personal Care",
  "Other",
]

const WEEKDAYS = [
  { name: "Sunday", value: 0 },
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
]

export function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [formData, setFormData] = useState({
    name: habit?.name || "",
    description: habit?.description || "",
    color: habit?.color || "bg-blue-500",
    category: habit?.category || "",
    frequency: habit?.frequency || ("daily" as const),
    targetDays: habit?.targetDays || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    const newHabit: Habit = {
      id: habit?.id || generateId(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      category: formData.category || undefined,
      frequency: formData.frequency,
      targetDays: formData.frequency === "weekly" ? formData.targetDays : undefined,
      createdAt: habit?.createdAt || new Date(),
      isActive: habit?.isActive ?? true,
    }

    saveHabit(newHabit)
    onSave?.(newHabit)
  }

  const toggleWeekday = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      targetDays: prev.targetDays.includes(day)
        ? prev.targetDays.filter((d) => d !== day)
        : [...prev.targetDays, day].sort(),
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{habit ? "Edit Habit" : "Create New Habit"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Drink 8 glasses of water"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add more details about your habit..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                  className={`w-8 h-8 rounded-full ${color.value} ${
                    formData.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setFormData((prev) => ({ ...prev, frequency: value, targetDays: [] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Target Days</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <Badge
                    key={day.value}
                    variant={formData.targetDays.includes(day.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleWeekday(day.value)}
                  >
                    {day.name.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {habit ? "Update Habit" : "Create Habit"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
