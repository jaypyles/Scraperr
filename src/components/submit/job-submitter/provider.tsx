import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  Dispatch,
  useMemo,
} from "react";
import { Element, Result, SiteMap } from "@/types";

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
    ]
  );

  return (
    <JobSubmitterProvider.Provider value={value}>
      {children}
    </JobSubmitterProvider.Provider>
  );
};

export const useJobSubmitterProvider = () => {
  return useContext(JobSubmitterProvider);
};
