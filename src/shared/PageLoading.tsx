import { LoadingState } from './ui';

export function PageLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-field px-6 text-ink">
      <LoadingState label="Loading admin tools" />
    </div>
  );
}
