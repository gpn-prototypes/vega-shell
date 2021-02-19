type Task = VoidFunction;

const tasks: Task[] = [];

export function addCleanupTask(task: Task): void {
  tasks.push(task);
}

export function cleanup(): void {
  while (tasks.length > 0) {
    const task = tasks.pop() as Task;
    task();
  }
}
