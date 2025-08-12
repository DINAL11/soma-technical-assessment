import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch todos with their dependencies (dependsOn tasks)
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Fetch dependencies where this todo depends on other todos
        dependencies: {
          select: {
            dependsOn: true,
          },
        },
      },
    });
    

    // Format todos to include dependencies as array of todo objects
    const formattedTodos = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      dueDate: todo.dueDate,
      imageUrl: todo.imageUrl,
      createdAt: todo.createdAt,
      dependencies: todo.dependencies.map((d) => d.dependsOn),
    }));

    return NextResponse.json(formattedTodos);
  } catch (error) {
    console.error("Error fetching todos with dependencies:", error);
    return NextResponse.json(
      { error: "Error fetching todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, dueDate, imageUrl } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Error creating todo" },
      { status: 500 }
    );
  }
}
