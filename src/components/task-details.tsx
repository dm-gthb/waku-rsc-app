'use client';

import { editTask } from '../actions/edit-task';
import { manageTask } from '../actions/manage-task';
import { TaskWithSubtasks } from '../db/types';
import { CompletionTaskButton } from './completion-task-button';
import { List } from './task-list';
import { Dispatch, SetStateAction, useActionState, useOptimistic, useState } from 'react';

export function TaskDetails({ task: initTask }: { task: TaskWithSubtasks }) {
  const [task, setTask] = useState(initTask);
  const [optimisticTask, setOptimisticTask] = useOptimistic(
    task,
    (_, newTask: TaskWithSubtasks) => newTask,
  );
  return (
    <div>
      <TaskInfo
        task={optimisticTask}
        onInfoUpdate={setTask}
        onOptimisticUpdate={setOptimisticTask}
      />
      <TaskSubtasks
        task={optimisticTask}
        onOptimisticUpdate={setOptimisticTask}
        onSubtaskUpdate={setTask}
      />
    </div>
  );
}

function TaskInfo({
  task,
  onInfoUpdate,
  onOptimisticUpdate,
}: {
  task: TaskWithSubtasks;
  onInfoUpdate: Dispatch<SetStateAction<TaskWithSubtasks>>;
  onOptimisticUpdate: (action: TaskWithSubtasks) => void;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [_, completionFormAction] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const isCompleting = formData.get('isToCompleteIntension') === 'true';

      const updateTaskWithSubtasks = (
        taskToUpdate: TaskWithSubtasks,
      ): TaskWithSubtasks => {
        const updatedTask = {
          ...taskToUpdate,
          completedAt: isCompleting ? new Date().toISOString() : null,
        };

        if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
          return {
            ...updatedTask,
            subtasks: updatedTask.subtasks.map((subtask) => ({
              ...subtask,
              completedAt: isCompleting ? new Date().toISOString() : null,
            })),
          };
        }

        return updatedTask;
      };

      onOptimisticUpdate(updateTaskWithSubtasks(task));

      const result = await manageTask(formData);

      if (result.success) {
        setIsEditMode(false);
        onInfoUpdate((prev) => {
          if (!result.updatedTasks || result.updatedTasks.length === 0) {
            return prev;
          }

          const updatedTasksMap = new Map(
            result.updatedTasks.map((task) => [task.id, task]),
          );

          const mainTask = updatedTasksMap.get(task.id);
          if (!mainTask) {
            return prev;
          }
          return {
            ...prev,
            completedAt: mainTask.completedAt,
            subtasks: prev.subtasks.map((subtask) => {
              const updatedSubtask = result.updatedTasks.find((t) => t.id === subtask.id);
              if (updatedSubtask) {
                return {
                  ...subtask,
                  completedAt: updatedSubtask.completedAt,
                };
              }
              return subtask;
            }),
          };
        });
      }

      return result;
    },
    {
      success: false,
      error: null,
      updatedTasks: [],
    },
  );

  const [formState, infoFormAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await editTask(prevState, formData);

      if (result.success) {
        setIsEditMode(false);
        onInfoUpdate((prev) => ({
          ...prev,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
        }));
      }

      return result;
    },
    {
      success: false,
      error: null,
      updatedTask: undefined,
    },
  );
  return (
    <div>
      {isEditMode ? (
        <form action={infoFormAction} className="mb-4">
          <fieldset disabled={isPending} className={`${isPending ? 'opacity-50' : ''}`}>
            <div className="flex justify-between gap-4">
              <div className="flex flex-col w-full border border-gray-300 p-2 rounded-lg">
                <input type="hidden" name="taskId" value={task.id} />
                <input
                  className="text-2xl font-bold mb-1 p-2"
                  name="title"
                  defaultValue={task.title ?? ''}
                  autoFocus
                />
                <textarea
                  rows={2}
                  className="p-2"
                  name="description"
                  placeholder="Task description"
                  defaultValue={task.description ?? ''}
                />
              </div>

              <div className="flex gap-2 items-start">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  {isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="cursor-pointer min-w-24 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </fieldset>
          {formState.error && <p className="text-red-500 mt-2">{formState.error}</p>}
        </form>
      ) : (
        <div className="flex justify-between gap-4">
          <div>
            <div className="flex items-center mb-4 gap-2">
              <CompletionTaskButton task={task} formAction={completionFormAction} />
              <h1
                className={`${task.completedAt ? 'line-through' : ''} text-2xl font-bold`}
              >
                {task.title}
              </h1>
            </div>
            <p>
              Completion status:{' '}
              <span className="font-mono">{task.completedAt ? 'Done' : 'Not Done'}</span>
            </p>
            {task.description && <p className="mb-8">Description: {task.description}</p>}
          </div>
          <div className="flex gap-2 items-start">
            <button
              onClick={() => setIsEditMode(true)}
              className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </button>
            <button className="cursor-pointer min-w-24 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskSubtasks({
  task,
  onSubtaskUpdate,
  onOptimisticUpdate,
}: {
  task: TaskWithSubtasks;
  onSubtaskUpdate: Dispatch<SetStateAction<TaskWithSubtasks>>;
  onOptimisticUpdate: (action: TaskWithSubtasks) => void;
}) {
  const [_, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const updatedSubtasks = task.subtasks.map((subtask) => {
        if (subtask.id === formData.get('taskId')) {
          return {
            ...subtask,
            completedAt:
              formData.get('isToCompleteIntension') === 'true'
                ? new Date().toISOString()
                : null,
          };
        }
        return subtask;
      });

      const allSubtasksCompleted = updatedSubtasks.every(
        ({ completedAt }) => completedAt !== null,
      );

      onOptimisticUpdate({
        ...task,
        completedAt: allSubtasksCompleted
          ? updatedSubtasks[0]?.completedAt || new Date().toISOString()
          : null,
        subtasks: updatedSubtasks,
      });

      const result = await manageTask(formData);

      if (result.success && result.updatedTasks && result.updatedTasks.length > 0) {
        const updatedSubtasks = task.subtasks.map((subtask) => {
          const updatedSubtask = result.updatedTasks.find((t) => t.id === subtask.id);
          if (updatedSubtask) {
            return {
              ...subtask,
              ...updatedSubtask,
            };
          }
          return subtask;
        });

        const allSubtasksCompleted = updatedSubtasks.every(
          ({ completedAt }) => completedAt !== null,
        );

        onSubtaskUpdate((prev) => ({
          ...prev,
          completedAt: allSubtasksCompleted
            ? updatedSubtasks[0]?.completedAt || new Date().toISOString()
            : null,
          subtasks: updatedSubtasks,
        }));
      }

      return result;
    },
    {
      success: false,
      error: null,
      updatedTasks: [],
    },
  );

  return (
    <div>
      <h3>Subtasks</h3>
      <List tasks={task.subtasks} formAction={formAction} />
    </div>
  );
}

// export function TaskDetails({ task: initTask }: { task: TaskWithSubtasks }) {
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [task, setTask] = useState(initTask);

//   const [formState, formAction, isPending] = useActionState(
//     async (_prevState: unknown, formData: FormData) => {
//       const result = await createTask(_prevState, formData);
//       if (result.success) {
//         setIsEditMode(false);
//         setTask((prev) => {
//           if (result.task) {
//             return {
//               ...prev,
//               subtasks: [...prev.subtasks, result.task],
//             };
//           }
//           return prev;
//         });
//       }

//       return {
//         success: result.success,
//         error: result.error,
//         task: result.task,
//       };
//     },
//     {
//       success: false,
//       error: null,
//       task: undefined,
//     },
//   );

//   return (
//     <div>
//       <div className="mb-6">
//         <TaskList tasks={[task]} key={task.id + task.subtasks.length} />
//       </div>

//       {isEditMode && (
//         <form action={formAction} className="mb-4">
//           <fieldset disabled={isPending} className={`${isPending ? 'opacity-50' : ''}`}>
//             <input type="hidden" name="projectId" value={task.projectId} />
//             <input type="hidden" name="parentTaskId" value={task.id ?? ''} />
//             <input type="hidden" name="completedAt" value={task.completedAt ?? ''} />
//             <div className="flex flex-col items-end gap-2">
//               <div className="flex flex-col w-full border border-gray-300 p-2 rounded-lg">
//                 <input
//                   name="title"
//                   autoFocus
//                   placeholder="Task name"
//                   className="w-full mb-1 font-bold p-2"
//                 />
//                 <textarea
//                   rows={2}
//                   name="description"
//                   placeholder="Description"
//                   className="w-full p-2"
//                 />
//               </div>

//               <div className="flex gap-2 items-start">
//                 <button
//                   onClick={() => setIsEditMode(true)}
//                   className="cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
//                 >
//                   {isPending ? 'Saving...' : 'Save'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setIsEditMode(false)}
//                   className="cursor-pointer min-w-24 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </fieldset>
//           {formState.error && <p className="text-red-500 mt-2">{formState.error}</p>}
//         </form>
//       )}

//       {!isEditMode && (
//         <button
//           onClick={() => setIsEditMode(true)}
//           className="ml-6 cursor-pointer min-w-24 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
//         >
//           + Add Task
//         </button>
//       )}
//     </div>
//   );
// }
