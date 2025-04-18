import React from "react";
import { Cycle } from "../types/jobs";
import { CyclePieChart } from "./graphs/CyclePieChart";
import { ApplicationsTrandsChart } from "./graphs/ApplicationsTrandsChart";
import { CycleTotalApplicationsChart } from "./graphs/CycleTotalApplicationsChart";
import { TopSuccessRatesList } from "./graphs/TopSuccessRatesList";
import { InterviewRateGauge } from "./graphs/InterviewRateGauge";

interface AreaChartData {
  date: string;
  applications: number;
}

interface GraphDashboardProps {
  currentCycle: Cycle | null;
  cycles: Cycle[];
  userId: string;
  areaChartData: AreaChartData[];
  stats: {
    all: number;
    applied: number;
    oa: number;
    interview: number;
    rejection: number;
    offer: number;
    other: number;
  };
}

export const GraphDashboard: React.FC<GraphDashboardProps> = ({
  cycles,
  userId,
  areaChartData,
  stats,
}) => {
  const interviewSuccess = stats.interview + stats.offer;
  const totalApplications = stats.all;

  return (
    <div className="space-y-10 bg-white p-4 rounded">
      <div className="grid grid-cols-1 grid-cols-custom gap-4">
        <CyclePieChart stats={stats} />
        <InterviewRateGauge
          total={totalApplications}
          success={interviewSuccess}
        />
        <CycleTotalApplicationsChart cyclesData={cycles} />
        <TopSuccessRatesList userId={userId} />
      </div>

      <div>
        <ApplicationsTrandsChart data={areaChartData} />
      </div>
    </div>
  );
};
