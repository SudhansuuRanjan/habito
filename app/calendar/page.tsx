import { HabitCalendar } from "@/components/habit-calendar"

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Habit Calendar</h1>
        <p className="text-muted-foreground text-sm md:text-base">Track your daily habits and build consistency</p>
      </div>
      <HabitCalendar />
    </div>
  )
}
