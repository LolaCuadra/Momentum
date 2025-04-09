import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const STATUS_COLORS = {
  todo: 'bg-gray-200 text-gray-700',
  'in progress': 'bg-yellow-200 text-yellow-800',
  done: 'bg-green-200 text-green-800',
};

export default function TasksPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: null,
    status: 'todo',
    category: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks);
  }, []);

  const progressPercent = tasks.length
    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
    : 0;

  const createTask = async () => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    const created = await res.json();
    setTasks([created, ...tasks]);
    setNewTask({ title: '', description: '', dueDate: null, status: 'todo', category: '' });
  };

  const updateTask = async (id, updates) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map(t => (t.id === id ? updated : t)));
    } else {
      console.error("Failed to update task", await res.text());
    }
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTasks(reordered);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.dueDate || Infinity);
    const dateB = new Date(b.dueDate || Infinity);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4 text-pink-600">Tasks</h1>

      <div className="mb-6">
        <div className="text-sm font-medium text-pink-700 mb-1">
          Progress: {progressPercent}%
        </div>
        <div className="w-full bg-pink-100 rounded-full h-2">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setLayout('list')}
          className={`px-3 py-1 rounded text-sm ${layout === 'list' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
        >
          List
        </button>
        <button
          onClick={() => setLayout('grid')}
          className={`px-3 py-1 rounded text-sm ${layout === 'grid' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
        >
          Grid
        </button>
      </div>

      <div className="mb-6 space-y-2">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Category (Work, School, Personal...)"
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
        />
        <DatePicker
          selected={newTask.dueDate}
          onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
          className="w-full p-2 border rounded"
          placeholderText="Due Date"
        />
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          onClick={createTask}
        >
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`grid gap-4 ${layout === 'list' ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {sortedTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-4 rounded shadow space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {task.dueDate && `Due: ${new Date(task.dueDate).toLocaleDateString()}`} 
                            {task.category && ` | Category: ${task.category}`}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <select
                            className={`text-xs rounded px-2 py-1 ${STATUS_COLORS[task.status]}`}
                            value={task.status}
                            onChange={(e) => updateTask(task.id, { status: e.target.value })}
                          >
                            <option value="todo">To Do</option>
                            <option value="in progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          <button
                            onClick={() => setEditingId(task.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {editingId === task.id && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => updateTask(task.id, { title: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                          <textarea
                            value={task.description}
                            onChange={(e) => updateTask(task.id, { description: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                          <button
                            className="bg-green-500 text-white px-4 py-1 rounded"
                            onClick={() => setEditingId(null)}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}