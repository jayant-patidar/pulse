import { PulseLoader } from '@/components/ui/PulseLoader';

export default function ProjectWorkspaceLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
      <PulseLoader size="lg" text="Loading Project..." />
    </div>
  );
}
