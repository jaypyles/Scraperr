import { Snackbar, Alert } from "@mui/material";

type ErrorSnackbarProps = {
  open: boolean;
  onClose: () => void;
  message: string;
};

export const ErrorSnackbar = ({
  open,
  onClose,
  message,
}: ErrorSnackbarProps) => {
  if (!open) return null;

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert severity="error">{message}</Alert>
    </Snackbar>
  );
};
