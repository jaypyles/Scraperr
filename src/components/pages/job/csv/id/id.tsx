import { CsvRow, CsvTable } from "@/components/common/csv-table/csv-table";

export type Csv = {
  rows: CsvRow[];
  headers: string[];
};

export const JobCsvId = ({ csv }: { csv: Csv }) => {
  return <CsvTable csv={csv} />;
};
