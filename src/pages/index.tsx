import { Provider as JobSubmitterProvider } from "@/components/submit/job-submitter/provider";
import { Home } from "@/components/pages/home/home";

export default function Main() {
  return (
    <JobSubmitterProvider>
      <Home />
    </JobSubmitterProvider>
  );
}
