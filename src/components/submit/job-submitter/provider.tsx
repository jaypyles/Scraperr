import { Element, RawJobOptions, Result, SiteMap } from "@/types";
import { initialJobOptions } from "@/types/job";
import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

type JobSubmitterProviderType = {
  submittedURL: string;
  setSubmittedURL: Dispatch<React.SetStateAction<string>>;
  rows: Element[];
  setRows: Dispatch<React.SetStateAction<Element[]>>;
  results: Result;
  setResults: Dispatch<React.SetStateAction<Result>>;
  snackbarOpen: boolean;
  setSnackbarOpen: Dispatch<React.SetStateAction<boolean>>;
  snackbarMessage: string;
  setSnackbarMessage: Dispatch<React.SetStateAction<string>>;
  snackbarSeverity: string;
  setSnackbarSeverity: Dispatch<React.SetStateAction<string>>;
  isValidURL: boolean;
  setIsValidUrl: Dispatch<React.SetStateAction<boolean>>;
  siteMap: SiteMap | null;
  setSiteMap: Dispatch<React.SetStateAction<SiteMap | null>>;
  jobOptions: RawJobOptions;
  setJobOptions: Dispatch<React.SetStateAction<RawJobOptions>>;
  closeSnackbar: () => void;
};

const JobSubmitterProvider = createContext<JobSubmitterProviderType>(
  {} as JobSubmitterProviderType
);

export const Provider = ({ children }: PropsWithChildren) => {
  const [submittedURL, setSubmittedURL] = useState<string>("");
  const [rows, setRows] = useState<Element[]>([]);
  const [results, setResults] = useState<Result>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<string>("error");
  const [isValidURL, setIsValidUrl] = useState<boolean>(true);
  const [siteMap, setSiteMap] = useState<SiteMap | null>(null);
  const [jobOptions, setJobOptions] =
    useState<RawJobOptions>(initialJobOptions);

  const closeSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
    setSnackbarSeverity("error");
  };

  const value: JobSubmitterProviderType = useMemo(
    () => ({
      submittedURL,
      setSubmittedURL,
      rows,
      setRows,
      results,
      setResults,
      snackbarOpen,
      setSnackbarOpen,
      snackbarMessage,
      setSnackbarMessage,
      snackbarSeverity,
      setSnackbarSeverity,
      isValidURL,
      setIsValidUrl,
      siteMap,
      setSiteMap,
      jobOptions,
      setJobOptions,
      closeSnackbar,
    }),
    [
      submittedURL,
      rows,
      results,
      snackbarOpen,
      snackbarMessage,
      snackbarSeverity,
      isValidURL,
      siteMap,
      jobOptions,
      closeSnackbar,
    ]
  );

  return (
    <JobSubmitterProvider.Provider value={value}>
      {children}
    </JobSubmitterProvider.Provider>
  );
};

export const useJobSubmitterProvider = (): JobSubmitterProviderType => {
  return useContext(JobSubmitterProvider);
};
