import { SiteHeader } from "@/components/site-header";
import { LoadingPanel } from "@/components/ui/loading-panel";

export default function DashboardLoading() {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="dashboard" mode="app" />
        <section className="mt-14 space-y-6">
          <LoadingPanel />
          <LoadingPanel />
        </section>
      </div>
    </main>
  );
}
