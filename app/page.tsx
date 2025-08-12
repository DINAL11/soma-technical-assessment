"use client";
import { Todo } from "@prisma/client";
import { useState, useEffect } from "react";
import DependencyGraph from "./components/DependencyGraph"; // Adjust path as needed


interface Dependency {
  todoId: number;
  dependsOnId: number;
}

interface TodoWithDeps extends Todo {
  dependencies: Todo[];
}

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState<TodoWithDeps[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedDeps, setSelectedDeps] = useState<number[]>([]);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);

  useEffect(() => {
    fetchTodos();
    fetchDependencies();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(data as TodoWithDeps[]);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const fetchDependencies = async () => {
    try {
      const res = await fetch("/api/todos/dependencies");
      const data = await res.json();
      setDependencies(data);
    } catch (error) {
      console.error("Failed to fetch dependencies:", error);
    }
  };

  const fetchPexelsImage = async (query: string): Promise<string | null> => {
    setLoadingImage(true);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          query
        )}&per_page=1`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
          },
        }
      );
      const data = await res.json();
      setLoadingImage(false);
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.medium;
      }
      return null;
    } catch (error) {
      setLoadingImage(false);
      console.error("Error fetching image from Pexels:", error);
      return null;
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    const imageUrl = await fetchPexelsImage(newTodo);

    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo, dueDate: dueDate || null, imageUrl }),
      });
      setNewTodo("");
      setDueDate("");
      fetchTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      fetchTodos();
      fetchDependencies();
      if (selectedTodoId === id) {
        setSelectedTodoId(null);
        setSelectedDeps([]);
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  // Handle selecting a todo to set dependencies
  const handleSelectTodo = (id: number) => {
    setSelectedTodoId(id);
    const deps = dependencies
      .filter((d) => d.todoId === id)
      .map((d) => d.dependsOnId);
    setSelectedDeps(deps);
  };

  // Handle toggling dependencies for selected todo
  const toggleDependency = (depId: number) => {
    if (selectedDeps.includes(depId)) {
      setSelectedDeps(selectedDeps.filter((id) => id !== depId));
    } else {
      setSelectedDeps([...selectedDeps, depId]);
    }
  };

  // Save dependencies to backend
  const saveDependencies = async () => {
    if (selectedTodoId === null) return;

    try {
      const res = await fetch("/api/todos/dependencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoId: selectedTodoId, dependsOnIds: selectedDeps }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Dependencies updated successfully!");
        fetchDependencies();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Failed to update dependencies:", error);
    }
  };

  const isPastDue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Compute earliest start dates based on dependencies
  function computeEarliestStartDates(todos: TodoWithDeps[]) {
    const graph: Record<number, number[]> = {};
    todos.forEach((todo) => {
      graph[todo.id] = todo.dependencies.map((dep) => dep.id);

    });

    const earliestStart: Record<number, number> = {};

    function dfs(id: number): number {
      if (earliestStart[id] !== undefined) return earliestStart[id];
      if (!graph[id] || graph[id].length === 0) {
        earliestStart[id] = 0;
        return 0;
      }
      const maxDep = Math.max(...graph[id].map(dfs));
      earliestStart[id] = maxDep + 1;
      return earliestStart[id];
    }

    todos.forEach((todo) => dfs(todo.id));
    return earliestStart;
  }

  // Find tasks on the critical path (longest dependency chain)
  function computeCriticalPath(earliestStart: Record<number, number>) {
    const maxStart = Math.max(...Object.values(earliestStart));
    return Object.entries(earliestStart)
      .filter(([_, val]) => val === maxStart)
      .map(([id]) => parseInt(id));
  }

  const earliestStartDates = computeEarliestStartDates(todos);
  const criticalPath = computeCriticalPath(earliestStartDates);


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Things To Do App
        </h1>

        {/* Add new todo */}
        <div className="flex mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-full focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-r-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            onClick={handleAddTodo}
            className="bg-white text-indigo-600 p-3 rounded-r-full hover:bg-gray-100 transition duration-300 ml-2"
            disabled={loadingImage}
          >
            {loadingImage ? "Loading..." : "Add"}
          </button>
        </div>

        {/* List todos */}
        <ul>
          {todos.map((todo) => {
            const isCritical = criticalPath.includes(todo.id);
            return (
              <li
                key={todo.id}
                className={`flex flex-col bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg cursor-pointer ${
                  isCritical ? "border-4 border-red-600" : ""
                }`}
                onClick={() => handleSelectTodo(todo.id)}
                style={{
                  border:
                    selectedTodoId === todo.id ? "2px solid #4f46e5" : "1px solid transparent",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">
                    {todo.title}{" "}
                    <small className="text-gray-600">
                      (Earliest Start: Day {earliestStartDates[todo.id] ?? 0})
                    </small>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTodo(todo.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition duration-300"
                  >
                    {/* Delete Icon */}
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {todo.dueDate && (
                  <span
                    className={
                      isPastDue(todo.dueDate)
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }
                  >
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
                {todo.imageUrl && (
                  <img
                    src={todo.imageUrl}
                    alt="Task visual"
                    className="mt-2 rounded max-h-40 object-cover"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Dependencies selector */}
        {selectedTodoId !== null && (
          <div className="mt-6 p-4 bg-white rounded shadow">
            <h2 className="font-bold mb-2">
              Set dependencies for {todos.find((t) => t.id === selectedTodoId)?.title}
            </h2>
            <p className="mb-2 text-sm text-gray-700">
              Select tasks that must be completed before this task.
            </p>
            <ul className="max-h-48 overflow-auto border border-gray-300 p-2 rounded">
              {todos
                .filter((t) => t.id !== selectedTodoId)
                .map((todo) => (
                  <li key={todo.id} className="mb-1">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedDeps.includes(todo.id)}
                        onChange={() => toggleDependency(todo.id)}
                      />
                      {todo.title}
                    </label>
                  </li>
                ))}
            </ul>
            <button
              onClick={saveDependencies}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Dependencies
            </button>
          </div>
        )}
      </div>
      <div className="my-6">
        <h2 className="text-white text-xl mb-2">Task Dependency Graph</h2>
        <DependencyGraph todos={todos} dependencies={dependencies} />
      </div>
    </div>
  );
}
