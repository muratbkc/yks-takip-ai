interface ProgressProps {
  value: number;
}

export function Progress({ value }: ProgressProps) {
  return (
    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

