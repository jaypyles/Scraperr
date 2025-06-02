import { Snackbar, Alert, Button } from "@mui/material";
import router from "next/router";

type JobNotifySnackbarProps = {
  open: boolean;
  onClose: () => void;
  message: string;
};

export const JobNotifySnackbar = ({
  open,
  onClose,
  message,
}: JobNotifySnackbarProps) => {
  if (!open) return null;

  const goTo = () => {
    router.push("/jobs");
  };

  const action = (
    <Button color="inherit" size="small" onClick={goTo}>
      Go To Job
    </Button>
  );

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert severity="info" action={action}>
        {message}
      </Alert>
    </Snackbar>
  );
};
