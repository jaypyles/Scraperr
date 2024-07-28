import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Box, Typography, useTheme } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Constants } from "../lib";
import { parseCookies } from "nookies";
import { GetServerSideProps } from "next/types";
import Cookies from "js-cookie";

Chart.register(...registerables);

type averageElement = {
  date: string;
  average_elements: number;
  count: number;
};

type averageJob = {
  date: string;
  job_count: number;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = parseCookies({ req });
  const token = cookies.token;
  let averageElement: averageElement[] = [];
  let averageJob: averageJob[] = [];

  if (token) {
    try {
      const averageElementResponse = await fetch(
        `http://scraperr_api:8000/statistics/get-average-element-per-link`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      averageElement = await averageElementResponse.json();

      const averageJobResponse = await fetch(
        `http://scraperr_api:8000/statistics/get-average-jobs-per-day`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      averageJob = await averageJobResponse.json();
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }

  return {
    props: { averageElement, averageJob },
  };
};

interface StatProps {
  averageElement: averageElement[];
  averageJob: averageJob[];
}

const Statistics: React.FC<StatProps> = ({ averageElement, averageJob }) => {
  const theme = useTheme();
  const elementsChartRef = useRef<HTMLCanvasElement>(null);
  const jobsChartRef = useRef<HTMLCanvasElement>(null);
  const [elementsChart, setElementsChart] = useState<Chart | null>(null);
  const [jobsChart, setJobsChart] = useState<Chart | null>(null);
  const [elementsData, setElementsData] =
    useState<averageElement[]>(averageElement);
  const [jobsData, setJobsData] = useState<averageJob[]>(averageJob);
  const { user } = useAuth();
  const token = Cookies.get("token");

  const fetchElementsData = async () => {
    try {
      const response = await fetch(
        `${Constants.DOMAIN}/api/statistics/get-average-element-per-link`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setElementsData(data);
    } catch (error) {
      console.error("Error fetching elements data:", error);
    }
  };

  const fetchJobsData = async () => {
    try {
      const response = await fetch(
        `${Constants.DOMAIN}/api/statistics/get-average-jobs-per-day`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setJobsData(data);
    } catch (error) {
      console.error("Error fetching jobs data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchElementsData();
      fetchJobsData();
    }
  }, [theme.palette.mode, user]);

  useEffect(() => {
    const dates = elementsData.map((item) => item.date);
    const averages = elementsData.map((item) => item.average_elements);

    if (elementsChartRef.current) {
      const ctx = elementsChartRef.current.getContext("2d");

      if (ctx) {
        if (elementsChart) {
          elementsChart.destroy();
        }

        const newChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Average Elements per Link",
                data: averages,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(75, 192, 192, 0.2)"
                    : "rgba(255, 99, 132, 0.2)",
                borderColor:
                  theme.palette.mode === "light"
                    ? "rgba(75, 192, 192, 1)"
                    : "rgba(255, 99, 132, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: theme.palette.text.primary,
                },
              },
              x: {
                ticks: {
                  color: theme.palette.text.primary,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          },
        });

        setElementsChart(newChart);
      }
    }
  }, [elementsData, theme.palette.mode]);

  useEffect(() => {
    const dates = jobsData.map((item) => item.date);
    const jobCounts = jobsData.map((item) => item.job_count);

    if (jobsChartRef.current) {
      const ctx = jobsChartRef.current.getContext("2d");

      if (ctx) {
        if (jobsChart) {
          jobsChart.destroy();
        }

        const newChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Average Jobs per Day",
                data: jobCounts,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(153, 102, 255, 0.2)"
                    : "rgba(54, 162, 235, 0.2)",
                borderColor:
                  theme.palette.mode === "light"
                    ? "rgba(153, 102, 255, 1)"
                    : "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: theme.palette.text.primary,
                },
              },
              x: {
                ticks: {
                  color: theme.palette.text.primary,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          },
        });

        setJobsChart(newChart);
      }
    }
  }, [jobsData, theme.palette.mode]);

  return (
    <>
      {user ? (
        <div className="flex flex-col space-y-2 justify-center text-center h-full w-full">
          <div className="flex flex-row space-x-2 h-full m-0 w-full">
            <div className="w-full h-full flex flex-col justify-center space-y-2 text-center">
              <Typography variant="h5">Average Elements per Link</Typography>
              <div className="relative w-full h-full">
                <canvas
                  ref={elementsChartRef}
                  className="absolute top-0 left-0 w-full h-full"
                ></canvas>
              </div>
            </div>
            <div className="w-full h-full flex flex-col justify-center space-y-2 text-center">
              <Typography variant="h5">Average Jobs per Day</Typography>
              <div className="relative w-full h-full">
                <canvas
                  ref={jobsChartRef}
                  className="absolute top-0 left-0 w-full h-full"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Box
          bgcolor="background.default"
          minHeight="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <h4
            style={{
              color: "#fff",
              padding: "20px",
              borderRadius: "8px",
              background: "rgba(0, 0, 0, 0.6)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            Statistics for jobs not viewable unless logged in.
          </h4>
        </Box>
      )}
    </>
  );
};

export default Statistics;
