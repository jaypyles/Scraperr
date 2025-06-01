import React from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
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
    <div className="flex flex-row space-x-4 items-center mb-2">
      <TextField
        data-cy="url-input"
        label="URL"
        variant="outlined"
        fullWidth
        value={submittedURL}
        onChange={(e) => setSubmittedURL(e.target.value)}
        error={!isValidURL}
        helperText={!isValidURL ? urlError : ""}
        className="rounded-md"
      />
      <Button
        data-cy="submit-button"
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={!(rows.length > 0) || loading}
        className={`bg-[#034efc] text-white font-semibold rounded-md 
                    transition-transform transform hover:scale-105 disabled:opacity-50`}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
      </Button>
    </div>
  );
};
