import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { JobSelector } from "../components/ai";
import { Job, Message } from "../types";
import { useSearchParams } from "next/navigation";
import { checkAI, fetchJob, fetchJobs, updateJob } from "../lib";
import SendIcon from "@mui/icons-material/Send";
import EditNoteIcon from "@mui/icons-material/EditNote";

const AI: React.FC = () => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [thinking, setThinking] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const getJobFromParam = async () => {
    const jobId = searchParams.get("job");
    if (jobId) {
      const job = await fetchJob(jobId);
      if (job.length) {
        setSelectedJob(job[0]);
        if (job[0].chat) {
          setMessages(job[0].chat);
        }
      }
    }
  };

  useEffect(() => {
    checkAI(setAiEnabled);
    getJobFromParam();
  }, []);

  useEffect(() => {
    if (selectedJob?.chat) {
      setMessages(selectedJob?.chat);
      return;
    }

    setMessages([]);
  }, [selectedJob]);

  const handleMessageSend = async (msg: string) => {
    if (!selectedJob) {
      throw Error("Job is not currently selected, but should be.");
    }

    const updatedMessages = await sendMessage(msg);
    await updateJob([selectedJob?.id], "chat", updatedMessages);
  };

  const sendMessage = async (msg: string) => {
    const newMessage = {
      content: msg,
      role: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage("");
    setThinking(true);

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

    const updatedMessages = [...messages, newMessage];

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let aiResponse = "";
    if (reader) {
      setThinking(false);
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
    return [...updatedMessages, { role: "assistant", content: aiResponse }];
  };

  const handleNewChat = (selectedJob: Job) => {
    updateJob([selectedJob.id], "chat", []);
    setMessages([]);
    fetchJobs(setJobs, { chat: true });
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
        borderRadius: "8px",
        border:
          theme.palette.mode === "light" ? "solid white" : "solid #4b5057",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
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
              borderRadius: "8px 8px 0 0",
              borderBottom: `2px solid ${theme.palette.divider}`,
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
                setJobs={setJobs}
                jobs={jobs}
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
                  borderRadius: "8px",
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
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      bgcolor:
                        message.role === "user"
                          ? theme.palette.UserMessage.main
                          : theme.palette.AIMessage.main,
                      marginLeft: message.role === "user" ? "auto" : "",
                      maxWidth: "40%",
                    }}
                  >
                    <Typography variant="body1" sx={{ color: "white" }}>
                      {message.content}
                    </Typography>
                  </Box>
                ))}
                {thinking && (
                  <Box
                    sx={{
                      width: "full",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                    }}
                  >
                    <Typography
                      sx={{
                        bgcolor: "rgba(128,128,128,0.1)",
                        maxWidth: "20%",
                        my: 2,
                        p: 1,
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                      variant="body1"
                    >
                      AI is thinking...
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tooltip title="New Chat" placement="top">
              <IconButton
                disabled={!(messages.length > 0)}
                sx={{ marginRight: 2 }}
                size="medium"
                onClick={() => {
                  if (!selectedJob) {
                    throw new Error("Selected job must be present but isn't.");
                  }
                  handleNewChat(selectedJob);
                }}
              >
                <EditNoteIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              placeholder="Type your message here..."
              disabled={!selectedJob}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMessageSend(currentMessage);
                }
              }}
              sx={{ borderRadius: "8px" }}
            />

            <Tooltip title="Send" placement="top">
              <IconButton
                color="primary"
                sx={{ ml: 2 }}
                disabled={!selectedJob}
                onClick={() => {
                  handleMessageSend(currentMessage);
                }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
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
