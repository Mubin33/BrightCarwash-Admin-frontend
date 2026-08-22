export type ChatMessage = {
  sender: "bot" | "user";
  text: string;
  time: string;
};

export type ChatStatus = "Normal" | "Need Inquiry" | "Urgent";

export type ChatSession = {
  id: string;
  date: string;
  label: ChatStatus;
  preview: string;
  messages: ChatMessage[];
};

export type ChatUser = {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  sessions: ChatSession[];
};

export const mockChatUsers: ChatUser[] = [
  {
    id: "sophia-chen",
    name: "Sophia Chen",
    email: "sophia.chen@yahoo.com",
    lastActive: "23 Aug",
    sessions: [
      {
        id: "session-1",
        date: "Jul 18, 2026",
        label: "Normal",
        preview: "Interested in monthly membership plans for two vehicles.",
        messages: [
          {
            sender: "bot",
            text: "Hey! I'm BrightSide AI. Got any questions about our prices or hours? Let's get your car booked super quick!",
            time: "8:00 AM",
          },
          {
            sender: "user",
            text: "How much for an SUV wash?",
            time: "8:02 AM",
          },
          {
            sender: "bot",
            text: "For SUVs, our Basic Wash starts at $35, Premium Detail is $65 and Ceramic Coating kicks off at $150+. Want me to check for available slots?",
            time: "8:03 AM",
          },
          {
            sender: "user",
            text: "What time do you open?",
            time: "8:05 AM",
          },
          {
            sender: "bot",
            text: "We're open from 8 AM to 6 PM, Monday to Saturday, and closed on Sundays. We're located in Naperville, IL. Need directions or want help booking?",
            time: "8:06 AM",
          },
          {
            sender: "user",
            text: "Book me in!",
            time: "8:08 AM",
          },
        ],
      },
      {
        id: "session-2",
        date: "Jun 30, 2026",
        label: "Need Inquiry",
        preview: "Asked about hours and location for the south location.",
        messages: [
          {
            sender: "bot",
            text: "Hello! How can I help with our south location today?",
            time: "3:10 PM",
          },
          {
            sender: "user",
            text: "Do you open on Sundays?",
            time: "3:12 PM",
          },
          {
            sender: "bot",
            text: "Our south location is open Monday to Saturday from 8 AM to 6 PM and closed on Sundays.",
            time: "3:13 PM",
          },
        ],
      },
    ],
  },
  {
    id: "liam-oconnor",
    name: "Liam O'Connor",
    email: "liam.oconnor@outlook.com",
    lastActive: "05 Sep",
    sessions: [
      {
        id: "session-3",
        date: "Sep 05, 2026",
        label: "Normal",
        preview: "Checking membership discounts for fleet vehicles.",
        messages: [
          {
            sender: "user",
            text: "Do you offer discounts for fleet customers?",
            time: "10:20 AM",
          },
          {
            sender: "bot",
            text: "Yes, we offer tiered pricing for fleets with 3+ vehicles. I can share the package details now.",
            time: "10:22 AM",
          },
        ],
      },
    ],
  },
  {
    id: "isabella-martinez",
    name: "Isabella Martínez",
    email: "isabella.martinez@gmail.com",
    lastActive: "17 Oct",
    sessions: [
      {
        id: "session-4",
        date: "Oct 17, 2026",
        label: "Urgent",
        preview: "Reported an issue with a recent ceramic coating appointment.",
        messages: [
          {
            sender: "user",
            text: "My ceramic coating appointment was canceled last minute. Can I reschedule?",
            time: "1:15 PM",
          },
          {
            sender: "bot",
            text: "I'm sorry about that. I can reschedule you for the next available slot, or put you on a priority waitlist.",
            time: "1:16 PM",
          },
        ],
      },
    ],
  },
];
