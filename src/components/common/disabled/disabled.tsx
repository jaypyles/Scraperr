import { Box } from "@mui/material";

export type DisabledProps = {
  message: string;
};

export const Disabled = ({ message }: DisabledProps) => {
  return (
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
        {message}
      </h4>
    </Box>
  );
};
