import React, { useState, useEffect, useRef } from "react";
import { Container, IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { Constants } from "../../../lib/constants";

import classes from "./log-container.module.css";

interface LogContainerProps {
  initialLogs: string;
}

export const LogContainer: React.FC<LogContainerProps> = ({ initialLogs }) => {
  const [logs, setLogs] = useState<string>(initialLogs);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${Constants.DOMAIN}/api/logs`);

    setLogs("");

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
      className={classes.logContainer}
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
