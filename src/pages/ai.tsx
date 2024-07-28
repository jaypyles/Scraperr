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

const AI: React.FC = () => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([
    {
      text: "What's up!",
      user: {
        id: "ai",
        name: "AI",
      },
    },
  ]);

  const sendMessage = async (msg: string) => {
    const newMessage = {
      text: msg,
      user: {
        id: "dan",
        name: "Dan",
      },
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage("");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: msg }),
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
          if (lastMessage && lastMessage.user.id === "ai") {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, text: aiResponse },
            ];
          } else {
            return [
              ...prevMessages,
              {
                text: aiResponse,
                user: {
                  id: "ai",
                  name: "AI",
                },
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
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          textAlign: "center",
          fontSize: "1.2em",
        }}
      >
        Chat with AI
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
                message.user.id === "dan"
                  ? "#6ea9d7"
                  : theme.palette.blurple.main,
              marginLeft: message.user.id === "dan" ? "auto" : "",
              maxWidth: "40%",
            }}
          >
            <Typography>{message.text}</Typography>
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
