import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to build current dependency graph
async function buildGraph() {
  const deps = await prisma.todoDependency.findMany();
  const graph: Record<number, number[]> = {};
  deps.forEach(({ todoId, dependsOnId }) => {
    if (!graph[todoId]) graph[todoId] = [];
    graph[todoId].push(dependsOnId);
  });
  return graph;
}

// Detect cycle in graph using DFS
function hasCycle(
  graph: Record<number, number[]>,
  start: number,
  current: number,
  visited: Set<number>
): boolean {
  if (visited.has(current)) return false;
  visited.add(current);
  for (const neighbor of graph[current] || []) {
    if (neighbor === start) return true;
    if (hasCycle(graph, start, neighbor, visited)) return true;
  }
  return false;
}

export async function GET() {
  try {
    const deps = await prisma.todoDependency.findMany();
    return NextResponse.json(deps);
  } catch (error) {
    console.error("Error fetching dependencies:", error);
    return NextResponse.json(
      { error: "Error fetching dependencies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { todoId, dependsOnIds } = await request.json();

    if (
      typeof todoId !== "number" ||
      !Array.isArray(dependsOnIds) ||
      dependsOnIds.some((id) => typeof id !== "number")
    ) {
      return NextResponse.json(
        { error: "todoId (number) and dependsOnIds (number array) are required" },
        { status: 400 }
      );
    }

    const graph = await buildGraph();

    // Add new dependencies for todoId temporarily to graph
    graph[todoId] = dependsOnIds;

    // Check if this causes a circular dependency
    if (hasCycle(graph, todoId, todoId, new Set())) {
      return NextResponse.json(
        { error: "Adding these dependencies creates a circular dependency" },
        { status: 400 }
      );
    }

    // Delete old dependencies for todoId
    await prisma.todoDependency.deleteMany({ where: { todoId } });

    // Create new dependencies
    if (dependsOnIds.length > 0) {
      const createData = dependsOnIds.map((depId) => ({
        todoId,
        dependsOnId: depId,
      }));
      await prisma.todoDependency.createMany({ data: createData });
    }

    return NextResponse.json({ message: "Dependencies updated" });
  } catch (error) {
    console.error("Error updating dependencies:", error);
    return NextResponse.json(
      { error: "Error updating dependencies" },
      { status: 500 }
    );
  }
}
