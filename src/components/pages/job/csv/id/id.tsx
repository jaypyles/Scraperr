import { CsvTable } from "@/components/common/csv-table/csv-table";

export type Csv = {
  rows: string[][];
  headers: string[];
};

export const JobCsvId = ({ csv }: { csv: Csv }) => {
  return <CsvTable csv={csv} />;
};
