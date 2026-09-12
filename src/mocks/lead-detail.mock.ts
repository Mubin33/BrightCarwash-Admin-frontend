// // src/mocks/lead-detail.mock.ts
// import type { LeadDetail, ActivityItem } from "@/types/lead-detail";

// export const mockLeadDetail: LeadDetail = {
// 	id: "lead_001",
// 	name: "John Doe",
// 	email: "john.doe@example.com",
// 	phone: "+1 555 123 4567",
// 	service: "Car Wash",
// 	vehicle: "Tesla Model S",
// 	source: "Website",
// 	priority: "HIGH",
// 	depositStatus: "PAID",
// 	stage: "Contacted",
// 	stageId: "stage_001",
// 	stageColor: "#B23730",
// 	assignedToId: "user_001",
// 	assignedToName: "Admin User",
// 	avatar: "/images/avatar-placeholder.png",
// 	notes: [
// 		{
// 			id: "note_1",
// 			content: "Interested in premium package",
// 			author: "Admin User",
// 			date: "Jun 25, 2026",
// 		},
// 		{
// 			id: "note_2",
// 			content: "Prefers morning calls",
// 			author: "John Doe",
// 			date: "Jun 24, 2026",
// 		},
// 	],
// 	date: "2026-06-20",
// };

// export const mockActivities: ActivityItem[] = [
// 	{
// 		id: "act_1",
// 		type: "staff",
// 		title: "Lead assigned",
// 		subtitle: "to Admin User",
// 		user: "System",
// 		date: "Jun 25, 2026",
// 	},
// 	{
// 		id: "act_2",
// 		type: "stage",
// 		title: "Stage changed",
// 		subtitle: "from New Lead to Contacted",
// 		user: "Admin User",
// 		date: "Jun 24, 2026",
// 	},
// 	{
// 		id: "act_3",
// 		type: "lead",
// 		title: "Lead created",
// 		user: "System",
// 		date: "Jun 20, 2026",
// 	},
// 	{
// 		id: "act_4",
// 		type: "coupon",
// 		title: "Coupon applied",
// 		description: "10% discount coupon",
// 		user: "Admin User",
// 		date: "Jun 20, 2026",
// 	},
// ];