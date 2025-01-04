interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gray-600 dark:bg-gray-300 transition-all duration-1000 ease-linear"
        style={{ width: `${progress * 100}%` }}
      ></div>
    </div>
  );
}
