import { LeadDetailContent } from "@/components/pages/lead-detail/LeadDetailContent";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
	const { id } = await params;
	return <LeadDetailContent leadId={id} />;
}