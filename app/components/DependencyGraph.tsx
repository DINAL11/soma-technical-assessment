"use client";

import React from "react";
import { Graph } from "react-d3-graph";

interface DependencyGraphProps {
  todos: {
    id: number;
    title: string;
  }[];
  dependencies: {
    todoId: number;
    dependsOnId: number;
  }[];
}

export default function DependencyGraph({ todos, dependencies }: DependencyGraphProps) {
  // Prepare nodes
  const nodes = todos.map((todo) => ({ id: todo.title }));

  // Prepare links
  // For each dependency: from dependsOn task to todo task (direction)
  const links = dependencies.map((dep) => {
    const from = todos.find((t) => t.id === dep.dependsOnId)?.title;
    const to = todos.find((t) => t.id === dep.todoId)?.title;
    if (!from || !to) return null;
    return { source: from, target: to };
  }).filter(Boolean) as { source: string; target: string }[];

  // Graph config
  const myConfig = {
    nodeHighlightBehavior: true,
    directed: true,
    height: 400,
    width: 600,
    node: {
      color: "lightblue",
      size: 400,
      highlightStrokeColor: "blue",
      fontSize: 14,
    },
    link: {
      highlightColor: "lightblue",
      strokeWidth: 2,
    },
    d3: {
      gravity: -400,
      linkLength: 120,
      linkStrength: 2,
    },
  };

  const data = {
    nodes,
    links,
  };

  return (
    <div className="my-8 border p-4 rounded bg-white shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Task Dependency Graph</h2>
      <Graph
        id="dependency-graph"
        data={data}
        config={myConfig}
        // You can add onClick handlers here if needed
      />
    </div>
  );
}
