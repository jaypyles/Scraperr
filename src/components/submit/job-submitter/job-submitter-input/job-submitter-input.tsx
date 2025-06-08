import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useJobSubmitterProvider } from "../provider";
import styles from "./job-submitter-input.module.css";

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
    <Box className={styles.container}>
      <TextField
        data-cy="url-input"
        label="URL"
        variant="outlined"
        fullWidth
        value={submittedURL}
        onChange={(e) => setSubmittedURL(e.target.value)}
        error={!isValidURL}
        helperText={!isValidURL ? urlError : ""}
        className={styles.input}
      />
      <Button
        data-cy="submit-button"
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={!(rows.length > 0) || loading}
        className={styles.submitButton}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
      </Button>
    </Box>
  );
};
