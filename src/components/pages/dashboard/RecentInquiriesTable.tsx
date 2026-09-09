import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { recentInquiriesColumns } from "@/components/pages/dashboard/RecentInquiriesColumns";
import type { RecentInquiry } from "@/types/dashboard";
import type { StageOption } from "@/components/ui/StageDropdown";
import Link from "next/link";

interface RecentInquiriesTableProps {
  data: RecentInquiry[];
  stages: StageOption[];
}

export function RecentInquiriesTable({ data, stages }: RecentInquiriesTableProps) {
  const columns = recentInquiriesColumns(stages);

  return (
    <div className="flex flex-col items-start gap-3 sm:gap-4 w-full">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-[#1A1C21] font-inter text-base sm:text-lg font-semibold leading-[130%] tracking-[0.09px]">
          Recent Inquiries
        </h3>
        <Link href="/leads" className="shrink-0">
          <Button
            variant="outline"
            className="flex py-2 sm:py-[10px] px-3 sm:px-4 justify-center items-center gap-1.5 sm:gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-xs sm:text-sm font-normal"
          >
            <Icon name="view-all" width={14} height={14} className="sm:w-4 sm:h-4" />
            View all
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowKey={(row: RecentInquiry) => row.id}
        className="w-full border rounded-xl border-[#DFE1E7]"
      />
    </div>
  );
}