import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  useTheme,
  IconButton,
} from "@mui/material";
import { JobSelector } from "../components/ai";
import { Job } from "../types";
import { useSearchParams } from "next/navigation";
import { checkAI, fetchJob } from "../lib";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  role: string;
  content: string;
}

const AI: React.FC = () => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const getJobFromParam = async () => {
    const jobId = searchParams.get("job");
    if (jobId) {
      const job = await fetchJob(jobId);
      if (job.length) {
        setSelectedJob(job[0]);
      }
    }
  };

  useEffect(() => {
    checkAI(setAiEnabled);
    getJobFromParam();
  }, []);

  const sendMessage = async (msg: string) => {
    const newMessage = {
      content: msg,
      role: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage("");

    const jobMessage = {
      role: "system",
      content: `Here is the content return from a scraping job: ${JSON.stringify(
        selectedJob?.result
      )} for the url: ${
        selectedJob?.url
      }. The following messages will pertain to the content of the scraped job.`,
    };

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [jobMessage, ...messages, newMessage] }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let aiResponse = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, content: aiResponse },
            ];
          } else {
            return [
              ...prevMessages,
              {
                content: aiResponse,
                role: "assistant",
              },
            ];
          }
        });
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "95vh",
        maxWidth: "100%",
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      {aiEnabled ? (
        <>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              textAlign: "center",
              fontSize: "1.2em",
              position: "relative",
              borderTop:
                theme.palette.mode === "light"
                  ? "2px inset #C0C0C0"
                  : "2px inset #000",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                padding: theme.spacing(1),
              }}
            >
              <Typography
                sx={{
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Chat with AI
              </Typography>
              <JobSelector
                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
                sxProps={{
                  position: "absolute",
                  right: theme.spacing(2),
                  width: "25%",
                }}
              />
            </Box>
          </Paper>
          <Box
            sx={{
              position: "relative",
              flex: 1,
              p: 2,
              overflowY: "auto",
              maxHeight: "100%",
            }}
          >
            {!selectedJob ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: 2,
                  bgcolor: "rgba(128,128,128,0.1)",
                  mt: 1,
                }}
                className="rounded-md"
              >
                <Typography variant="body1">
                  Select a Job to Begin Chatting
                </Typography>
              </Box>
            ) : (
              <>
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      my: 2,
                      p: 1,
                      borderRadius: 1,
                      bgcolor:
                        message.role === "user"
                          ? "#3e4859"
                          : theme.palette.AIMessage.main,
                      marginLeft: message.role === "user" ? "auto" : "",
                      maxWidth: "40%",
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              p: 2,
              borderTop: "1px solid #ccc",
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message here..."
              disabled={!selectedJob}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage(currentMessage);
                }
              }}
            />
            <IconButton
              color="primary"
              sx={{ ml: 2 }}
              disabled={!selectedJob}
              onClick={() => {
                sendMessage(currentMessage);
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </>
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
            Must set either OPENAI_KEY or OLLAMA_MODEL to use AI features.
          </h4>
        </Box>
      )}
    </Box>
  );
};

export default AI;
