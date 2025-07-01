
import MainLayout from "@/components/layout/MainLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { useDashboardCarousels } from "@/hooks/useDashboardCarousels";

const Dashboard = () => {
  const { carousels, loading, fetchCarousels, handleDelete } = useDashboardCarousels();

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">
          <DashboardHeader />

          <DashboardTabs 
            carousels={carousels}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
