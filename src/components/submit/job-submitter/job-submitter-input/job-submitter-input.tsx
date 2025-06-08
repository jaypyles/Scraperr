import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useJobSubmitterProvider } from "../provider";

export type JobSubmitterInputProps = {
  urlError: string | null;
  handleSubmit: () => void;
  loading: boolean;
};

export const JobSubmitterInput = ({
  handleSubmit,
  loading,
  urlError,
}: JobSubmitterInputProps) => {
  const { submittedURL, setSubmittedURL, isValidURL, rows } =
    useJobSubmitterProvider();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <TextField
        data-cy="url-input"
        label="URL"
        variant="outlined"
        fullWidth
        value={submittedURL}
        onChange={(e) => setSubmittedURL(e.target.value)}
        error={!isValidURL}
        helperText={!isValidURL ? urlError : ""}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
          },
        }}
      />
      <Button
        data-cy="submit-button"
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={!(rows.length > 0) || loading}
        sx={{
          minWidth: { xs: "100%", sm: 120 },
          height: { xs: 48, sm: 56 },
          borderRadius: 2,
          textTransform: "none",
          fontSize: "1rem",
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          "&:disabled": {
            transform: "none",
            boxShadow: "none",
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
      </Button>
    </Box>
  );
};
