export function ResultSkeleton() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton pill" style={{ width: '120px' }} />
      <div className="skeleton" style={{ width: '80%', height: '18px' }} />
      <div className="skeleton" style={{ width: '60%', height: '18px' }} />
      <div className="skeleton" style={{ width: '90%', height: '18px' }} />
    </div>
  );
}
