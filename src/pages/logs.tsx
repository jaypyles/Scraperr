import { LogContainer } from "../components/logs/log-container";

interface logs {
  logs: string;
}

export async function getStaticProps() {
  try {
    const response = await fetch(`http://scraperr_api:8000/initial_logs`);
    const logJson: logs = await response.json();
    const initialLogs = logJson.logs;

    return {
      props: {
        initialLogs,
      },
    };
  } catch (error) {
    console.error("Error fetching logs:", error);
    return {
      props: {
        initialLogs: "Failed to fetch logs.",
      },
    };
  }
}

interface LogProps {
  initialLogs: string;
}

const Logs = ({ initialLogs }: LogProps) => {
  return <LogContainer initialLogs={initialLogs} />;
};

export default Logs;
