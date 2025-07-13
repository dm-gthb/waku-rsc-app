export function CompletionTaskButton({
  isCompletedTask,
  onClick,
}: {
  isCompletedTask: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="cursor-pointer group/button">
      <div
        className={`border-1 border-gray-400 w-5 h-5 rounded-full ${isCompletedTask ? 'bg-gray-400' : ''}`}
      >
        <div
          className={`w-1.5 h-3 border-l ${isCompletedTask ? 'border-white opactity-100' : 'border-gray-500 opacity-0'} group-hover/button:opacity-100 border-t rotate-220 translate-x-1.5 translate-y-[1px] transition-opacity`}
        />
      </div>
    </button>
  );
}
