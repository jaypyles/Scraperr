import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  useTheme,
} from "@mui/material";
import { JobSelector } from "../components/ai";
import { Job } from "../types";

interface Message {
  role: string;
  content: string;
}

const AI: React.FC = () => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "What's up!",
      role: "assistant",
    },
  ]);

  const sendMessage = async (msg: string) => {
    const newMessage = {
      content: msg,
      role: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage("");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [...messages, newMessage] }),
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
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        paddingTop: theme.spacing(2),
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          textAlign: "center",
          fontSize: "1.2em",
          position: "relative",
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
      <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              my: 2,
              p: 1,
              borderRadius: 1,
              bgcolor:
                message.role === "user"
                  ? "#6ea9d7"
                  : theme.palette.AIMessage.main,
              marginLeft: message.role === "user" ? "auto" : "",
              maxWidth: "40%",
            }}
          >
            <Typography>{message.content}</Typography>
          </Box>
        ))}
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
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(currentMessage);
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
          onClick={() => {
            sendMessage(currentMessage);
          }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default AI;
