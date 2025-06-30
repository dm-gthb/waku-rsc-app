import { Link } from 'waku';
import { getDB } from '../../../../db';
import { delay } from '../../../../utils';
import { Task } from '../../../../db/types';

export default async function ProjectTasksPage({ projectId }: { projectId: string }) {
  const db = getDB();

  const tasks = await db.query.tasks.findMany({
    where: (tasks, { eq, and, isNull }) =>
      and(eq(tasks.projectId, projectId), isNull(tasks.parentTaskId)),
    with: {
      subtasks: true,
    },
  });

  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, projectId),
  });

  await delay(500);

  if (!project) {
    return <p>Project not found</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <div className="flex flex-col">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  isSubtask,
}: {
  task: Task & { subtasks?: Task[] };
  isSubtask?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <Link
        to={
          isSubtask
            ? `/project/${task.projectId}/tasks/${task.parentTaskId}/subtasks/${task.id}`
            : `/project/${task.projectId}/tasks/${task.id}`
        }
        className="border-b border-b-gray-100 py-3"
      >
        <div className="flex flex-col ">{task.title}</div>
      </Link>
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pl-6">
          {task.subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} isSubtask />
          ))}
        </div>
      )}
    </div>
  );
}
