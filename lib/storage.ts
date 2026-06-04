import { Task } from "@/types/task";
import { supabase, getSupabaseBrowserClient } from "./supabase";

const TASK_OWNER_TOKEN_KEY = "spark-owner-token";

type TaskRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: Task["priority"];
  duration: Task["duration"];
  due_date: string;
  done: boolean;
  owner_token?: string;
};

export async function loadTasks(): Promise<Task[]> {
  const client = await getSupabaseClient();

  const { data, error } = await client.from("tasks").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading tasks:", error);
    throw new Error("Couldn't load tasks from Supabase.");
  }

  return data.map(normalizeTaskFromDB).filter((task): task is Task => task !== null);
}

export async function createTask(task: Task) {
  const client = await getSupabaseClient();
  const ownerToken = await getOwnerToken();
  let data: unknown;
  let error: unknown;

  ({
    data,
    error
  } = await client.from("tasks").insert(taskToDB(task, ownerToken)).select("*").single());

  if (isMissingOwnerTokenColumnError(error)) {
    ({
      data,
      error
    } = await client.from("tasks").insert(taskToDB(task)).select("*").single());
  }

  if (error) {
    console.error("Error creating task:", error);
    throw new Error("Couldn't save the task in Supabase.");
  }

  const normalizedTask = normalizeTaskFromDB(data);

  if (!normalizedTask) {
    throw new Error("Supabase returned an invalid task while creating it.");
  }

  return normalizedTask;
}

export async function updateTask(task: Task) {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("tasks")
    .update(taskToDB(task))
    .eq("id", task.id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw new Error("Couldn't update the task in Supabase.");
  }

  const normalizedTask = normalizeTaskFromDB(data);

  if (!normalizedTask) {
    throw new Error("Supabase returned an invalid task while updating it.");
  }

  return normalizedTask;
}

export async function setTaskDone(taskId: string, done: boolean) {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("tasks")
    .update({ done })
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) {
    console.error("Error toggling task:", error);
    throw new Error("Couldn't update the task status in Supabase.");
  }

  const normalizedTask = normalizeTaskFromDB(data);

  if (!normalizedTask) {
    throw new Error("Supabase returned an invalid task while changing its status.");
  }

  return normalizedTask;
}

export async function deleteTaskById(taskId: string) {
  const client = await getSupabaseClient();
  const { error } = await client.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw new Error("Couldn't delete the task in Supabase.");
  }
}

async function getSupabaseClient() {
  const ownerToken = await getOwnerToken();
  return getSupabaseBrowserClient(ownerToken);
}

async function getOwnerToken(): Promise<string> {
  // Prefer the authenticated user's ID for proper data scoping
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  // Fallback to localStorage token for unauthenticated use
  if (typeof window === "undefined") {
    throw new Error("Task storage requires a browser environment.");
  }
  const existing = window.localStorage.getItem(TASK_OWNER_TOKEN_KEY);
  if (existing) return existing;
  const newToken = `task-owner-${crypto.randomUUID()}`;
  window.localStorage.setItem(TASK_OWNER_TOKEN_KEY, newToken);
  return newToken;
}

function getOrCreateTaskOwnerToken() {
  if (typeof window === "undefined") {
    throw new Error("Task storage requires a browser environment.");
  }
  const existing = window.localStorage.getItem(TASK_OWNER_TOKEN_KEY);
  if (existing) return existing;
  const newToken = `task-owner-${crypto.randomUUID()}`;
  window.localStorage.setItem(TASK_OWNER_TOKEN_KEY, newToken);
  return newToken;
}

function taskToDB(task: Task, ownerToken?: string) {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    description: task.description,
    priority: task.priority,
    duration: task.duration,
    due_date: task.dueDate,
    done: task.done,
    ...(ownerToken ? { owner_token: ownerToken } : {})
  };
}

function normalizeTaskFromDB(value: unknown): Task | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Partial<TaskRow>;

  if (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.category === "string" &&
    typeof row.description === "string" &&
    (row.priority === "low" || row.priority === "medium" || row.priority === "high") &&
    (row.duration === "short" || row.duration === "medium" || row.duration === "long") &&
    typeof row.due_date === "string" &&
    typeof row.done === "boolean"
  ) {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      priority: row.priority,
      duration: row.duration,
      dueDate: row.due_date,
      done: row.done
    };
  }

  return null;
}

function isMissingOwnerTokenColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const supabaseError = error as {
    code?: string;
    message?: string;
  };

  return (
    supabaseError.code === "PGRST204" &&
    typeof supabaseError.message === "string" &&
    supabaseError.message.includes("owner_token")
  );
}
