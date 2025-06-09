import { Box, Button, Typography } from "@mui/material";

export type UploadFileProps = {
  message: string;
  onUploadFile: (file: File) => void;
};

export const UploadFile = ({ message, onUploadFile }: UploadFileProps) => {
  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <Box>
      <Button variant="contained" component="label">
        <Typography>{message}</Typography>
        <input type="file" hidden onChange={handleUploadFile} />
      </Button>
    </Box>
  );
};
