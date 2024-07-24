import { Container, IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { Constants } from "../lib";

const Logs = () => {
  const [logs, setLogs] = useState("");
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${Constants.DOMAIN}/api/logs`);

    eventSource.onmessage = (event) => {
      setLogs((prevLogs) => prevLogs + event.data + "\n");
      if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop =
          logsContainerRef.current.scrollHeight;
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const scrollToTop = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  };

  return (
    <Container
      sx={{
        position: "relative",
        backgroundColor: "black",
        color: "white",
        padding: "10px",
        overflowY: "scroll",
        whiteSpace: "pre-wrap",
        overflowWrap: "normal",
        maxHeight: "95vh",
      }}
      maxWidth="xl"
      ref={logsContainerRef}
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
      <IconButton
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
        onClick={scrollToTop}
      >
        <ArrowUpward style={{ color: "white" }} />
      </IconButton>
      <IconButton
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
        onClick={scrollToBottom}
      >
        <ArrowDownward style={{ color: "white" }} />
      </IconButton>
    </Container>
  );
};

export default Logs;
