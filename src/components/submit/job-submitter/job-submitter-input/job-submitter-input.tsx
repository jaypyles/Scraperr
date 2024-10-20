import React, { Dispatch } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
import { Element } from "@/types";

export type JobSubmitterInputProps = {
  submittedURL: string;
  setSubmittedURL: Dispatch<React.SetStateAction<string>>;
  isValidURL: boolean;
  urlError: string | null;
  handleSubmit: () => void;
  loading: boolean;
  rows: Element[];
};

export const JobSubmitterInput = ({
  submittedURL,
  setSubmittedURL,
  isValidURL,
  urlError,
  handleSubmit,
  loading,
  rows,
}: JobSubmitterInputProps) => {
  return (
    <div className="flex flex-row space-x-4 items-center mb-2">
      <TextField
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
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={!(rows.length > 0) || loading}
        className={`bg-gradient-to-r from-[#034efc] to-gray-500 text-white font-semibold rounded-md 
                    transition-transform transform hover:scale-105 disabled:opacity-50`}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
      </Button>
    </div>
  );
};
