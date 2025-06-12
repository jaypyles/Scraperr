import { Box, Button, Typography } from "@mui/material";

export type UploadFileProps = {
  message: string;
  fileTypes?: string[];
  onUploadFile: (file: File) => void;
};

export const UploadFile = ({
  message,
  fileTypes,
  onUploadFile,
}: UploadFileProps) => {
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
        <input
          type="file"
          hidden
          onChange={handleUploadFile}
          accept={fileTypes?.join(",")}
        />
      </Button>
    </Box>
  );
};
