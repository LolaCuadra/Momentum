'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CATEGORY_COLORS = {
  Health: 'bg-green-100 text-green-800',
  Productivity: 'bg-blue-100 text-blue-800',
  Personal: 'bg-purple-100 text-purple-800',
};

export default function HabitsPage() {
  const { user } = useUser();
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    startDate: new Date(),
    reminders: false,
    category: 'Health',
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [viewType, setViewType] = useState('grid'); // Grid or list view
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetch('/api/habits')
      .then(res => res.json())
      .then(setHabits);
  }, []);

  const createHabit = async () => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHabit),
    });
    const created = await res.json();
    setHabits([created, ...habits]);
    setNewHabit({ name: '', description: '', frequency: 'daily', startDate: new Date(), reminders: false, category: 'Health' });
  };

  const deleteHabit = async (id) => {
    await fetch(`/api/habits/${id}`, {
      method: 'DELETE'
    });
    setHabits(habits.filter(h => h.id !== id));
  };

  const updateHabit = async () => {
    if (!editingId) return;
    const res = await fetch(`/api/habits/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingData),
    });
    const updated = await res.json();
    setHabits(habits.map(h => h.id === editingId ? updated : h));
    setEditingId(null);
    setEditingData(null);
  };

  const markProgress = async (habitId: string, date: Date, completed: boolean) => {
    await fetch(`/api/habits/${habitId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, completed }),
    });

    // Update streak calculation based on the date
    const habit = habits.find(h => h.id === habitId);
    const streakCount = calculateStreak(habit.progress, date);
    habit.streak = streakCount;
    setHabits([...habits]);
  };

  const calculateStreak = (progress, date) => {
    const today = new Date(date).toISOString().split('T')[0];
    const sortedProgress = progress
      .filter(p => p.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let prevDate = new Date(today);

    for (const p of sortedProgress) {
      const progressDate = new Date(p.date);
      if (prevDate.toDateString() === progressDate.toDateString()) {
        streak++;
      } else if (
        prevDate.toDateString() === new Date(progressDate.getTime() + 86400000).toDateString()
      ) {
        streak++;
        prevDate = progressDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const sortedHabits = habits.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });

  const habitGridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedHabits.map(habit => (
        <div key={habit.id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{habit.name}</h3>
            <button
              className="text-blue-500 text-sm hover:underline"
              onClick={() => {
                setEditingId(habit.id);
                setEditingData({ ...habit });
              }}
            >Edit</button>
            <button
              className="text-red-500 text-sm hover:underline"
              onClick={() => deleteHabit(habit.id)}
            >Delete</button>
          </div>
          <p>{habit.description}</p>
          <p className="text-sm text-gray-400">{habit.category}</p>
          <div className="mt-2">
            <button
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={() => markProgress(habit.id, new Date(), true)}
            >
              Mark as Done
            </button>
            <div className="text-sm mt-2">
              Streak: {habit.streak} days
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-pink-600">Habits</h1>

      {/* Toggle View */}
      <div className="flex mb-6 gap-4">
        <button
          onClick={() => setViewType('grid')}
          className={`px-4 py-2 ${viewType === 'grid' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewType('list')}
          className={`px-4 py-2 ${viewType === 'list' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
        >
          List View
        </button>
      </div>

      {/* New Habit Input */}
      <div className="grid gap-2 mb-6">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Habit name"
          value={newHabit.name}
          onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newHabit.description}
          onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
        />
        <DatePicker
          selected={newHabit.startDate}
          onChange={(date) => setNewHabit({ ...newHabit, startDate: date })}
          className="w-full p-2 border rounded"
          placeholderText="Start Date"
        />
        <select
          value={newHabit.frequency}
          onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </select>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Category"
          value={newHabit.category}
          onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
        />
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          onClick={createHabit}
        >
          Add Habit
        </button>
      </div>

      {/* Calendar view to see streaks */}
      <div className="mb-6">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date, view }) => {
            // Add custom styles for streaks
            if (habits.some(habit => habit.progress.some(p => new Date(p.date).toDateString() === date.toDateString()))) {
              return 'bg-green-300';
            }
            return '';
          }}
        />
      </div>

      {/* Habits Display */}
      {viewType === 'grid' ? habitGridView : (
        <ul className="space-y-4">
          {sortedHabits.map((habit) => (
            <li key={habit.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{habit.name}</h3>
                <button
                  className="text-blue-500 text-sm hover:underline"
                  onClick={() => {
                    setEditingId(habit.id);
                    setEditingData({ ...habit });
                  }}
                >Edit</button>
                <button
                  className="text-red-500 text-sm hover:underline"
                  onClick={() => deleteHabit(habit.id)}
                >Delete</button>
              </div>
              <p>{habit.description}</p>
              <p className="text-sm text-gray-400">{habit.category}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}