export default function JobSkeleton() {
  return (
    <div className="animate-pulse bg-surface rounded-xl p-4 space-y-4 border border-slate-800">
      <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
      <div className="h-4 w-2/3 bg-slate-700 rounded"></div>
      <div className="h-3 w-3/4 bg-slate-800 rounded"></div>
      <div className="flex space-x-2 mt-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-slate-800 rounded-full"></div>
        ))}
      </div>
    </div>
  );
}
