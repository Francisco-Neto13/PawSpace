import OverviewContent from "@/components/overview/OverviewContent";

export default function OverviewPage() {
  const emptyData = {
    total: 0,
    unlocked: 0,
    progress: 0
  };

  return <OverviewContent initialData={emptyData} />;
}