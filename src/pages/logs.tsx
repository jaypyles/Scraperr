import { Container } from "@mui/material";
import { useEffect, useState } from "react";

const Logs = () => {
  const [logs, setLogs] = useState("");

  useEffect(() => {
    const eventSource = new EventSource("/api/logs");

    eventSource.onmessage = (event) => {
      setLogs((prevLogs) => prevLogs + event.data + "\n");
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Container
      sx={{
        backgroundColor: "black",
        color: "white",
        padding: "10px",
        overflowY: "scroll",
        whiteSpace: "pre-wrap",
        overflowWrap: "normal",
        width: "100%",
      }}
      maxWidth="xl"
    >
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          margin: 0,
        }}
      >
        {logs}
      </pre>
    </Container>
  );
};

export default Logs;
