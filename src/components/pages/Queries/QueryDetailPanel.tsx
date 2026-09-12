// // components/QueryDetailPanel.tsx
// "use client";

// import { X, Mail, Trash2, Mail as EmailIcon, Copy } from "lucide-react";
// import { format } from "date-fns";
// import { useEffect } from "react";
// import { FilterDropdown } from "@/components/ui/FilterDropdown";

// interface QueryDetailPanelProps {
//   isOpen: boolean;
//   onClose: () => void;
//   data: {
//     id: string;
//     full_name: string;
//     email: string;
//     phone: string;
//     vehicle: string;
//     status: string;
//     date: string;
//     message?: string;
//   } | null;
//   onStatusChange?: (id: string, status: string) => void;
//   onSendEmail?: (id: string) => void;
//   onDelete?: (id: string) => void;
// }

// export default function QueryDetailPanel({
//   isOpen,
//   onClose,
//   data,
//   onSendEmail,
//   onDelete,
//   onStatusChange,
// }: QueryDetailPanelProps) {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   // Handle escape key
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, [onClose]);

//   if (!data) return null;

//   const statusStyles: Record<string, string> = {
//     new: "bg-[#E6F5FD] text-[#0098E8]",
//     replied: "bg-[#DCF7EA] text-[#006F1F]",
//     closed: "bg-[#FFE6E6] text-[#FF4345]",
//   };

//   const statusLabels: Record<string, string> = {
//     new: "New",
//     replied: "Replied",
//     closed: "Closed",
//   };

//   const handleDelete = () => {
//     if (window.confirm("Are you sure you want to delete this query?")) {
//       onDelete?.(data.id);
//       onClose();
//     }
//   };

//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-[#0098E81F] backdrop-blur-sm z-50 duration-300 ${
//           isOpen ? "" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={onClose}
//       />

//       <div
//         className={`fixed top-0 right-0 h-full w-full sm:w-120 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E9] shrink-0">
//           <div>
//             <h3 className="text-2xl font-medium text-[#1D1F2C]">
//               Query Details
//             </h3>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-[#F5F5F5] transition-colors duration-200 border border-[#777980]"
//           >
//             <X className="text-[#777980]" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {/* Info Grid */}
//           <div className="space-y-5">
//             {/* Full Name */}
//             <div>
//               <p className="text-sm lg:text-base  text-[#777980] mb-3">
//                 Full Name
//               </p>
//               <p className="text-base lg:text-lg  font-medium text-[#0B1220]">
//                 {data.full_name}
//               </p>
//             </div>
//             {/* Date */}
//             <div>
//               <p className="text-sm lg:text-base text-[#777980] mb-2">Date</p>
//               <p className="text-base lg:text-lg font-medium text-[#0B1220]">
//                 {format(new Date(data.date), "d MMM, yyyy")}
//               </p>
//             </div>

//             {/* Email */}
//             <div>
//               <p className="text-sm lg:text-base text-[#777980] mb-2">
//                 Email Address
//               </p>
//               <div className="flex items-center gap-2 justify-between">
//                 <p className="text-base lg:text-lg font-medium">{data.email}</p>
//                 <button>
//                   <Copy className="w-5 h-5 text-[#b23730]" />
//                 </button>
//               </div>
//             </div>
//             {/* Phone */}
//             <div>
//               <p className="text-sm lg:text-base text-[#777980] mb-2">
//                 Phone Number
//               </p>
//               <div className="flex items-center gap-2 justify-between">
//                 <p className="text-base lg:text-lg font-medium">{data.phone}</p>
//                 <button>
//                   <Copy className="w-5 h-5 text-[#b23730]" />
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-start justify-between ">
//               {/* Vehicle */}
//               <div>
//                 <p className="text-sm lg:text-base text-[#777980] mb-2">
//                   Vehicle
//                 </p>
//                 <p className="text-base font-medium text-[#0B1220]">
//                   {data.vehicle}
//                 </p>
//               </div>

//               {/* Status Badge */}
//               <div className="mb-6">
//                 <p className="text-sm lg:text-base text-[#777980] mb-2">
//                   Status
//                 </p>
//                 <FilterDropdown
//                   label="Status"
//                   options={[
//                     { value: "new", label: "New" },
//                     { value: "replied", label: "Replied" },
//                     { value: "closed", label: "Closed" },
//                   ]}
//                   dropdownOffsetX={-80}
//                   value={data.status}
//                   onChange={(value) => onStatusChange?.(data.id, value || "")}
//                   buttonClassName={`rounded-full border-none px-3 py-1.5 text-sm font-medium ${statusStyles[data.status] || ""}`}
//                 />
//               </div>
//             </div>

//             {/* Message (if available) */}
//             {data.message && (
//               <div className="mt-4 pt-4 border-t border-[#E8E8E9]">
//                 <p className="text-sm text-[#777980] mb-2">Message</p>
//                 <p className="text-base lg:text-lg text-[#0B1220] bg-[#F8F9FA] p-4 rounded-lg">
//                   {data.message}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="border-t border-[#E8E8E9] p-4 flex items-center gap-3 shrink-0">
//           <button
//             onClick={() => {
//               onSendEmail?.(data.id);
//               onClose();
//             }}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0098E8] text-white rounded-lg hover:bg-[#0081C9] transition-colors duration-200 font-medium"
//           >
//             <Mail className="w-4 h-4" />
//             Send E-mail
//           </button>
//           <button
//             onClick={handleDelete}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFE6E6] text-[#FF4345] rounded-lg hover:bg-[#FFD4D4] transition-colors duration-200 font-medium"
//           >
//             <Trash2 className="w-4 h-4" />
//             Delete
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// components/QueryDetailPanel.tsx
"use client";

import { X, Mail, Trash2, Copy } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { toast } from "react-toastify";

interface QueryDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    vehicle: string;
    status: string;
    date: string;
    message?: string;
  } | null;
  onStatusChange?: (id: string, status: string) => void;
  onSendEmail?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function QueryDetailPanel({
  isOpen,
  onClose,
  data,
  onSendEmail,
  onDelete,
  onStatusChange,
}: QueryDetailPanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!data) return null;

  const statusStyles: Record<string, string> = {
    new: "bg-[#E6F5FD] text-[#0098E8]",
    replied: "bg-[#DCF7EA] text-[#006F1F]",
    closed: "bg-[#FFE6E6] text-[#FF4345]",
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      onDelete?.(data.id);
      toast.success("Query deleted successfully");
      onClose();
    }
  };

  const handleSendEmail = () => {
    onSendEmail?.(data.email);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-[#0098E81F] backdrop-blur-sm z-50 duration-300 ${isOpen ? "" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-120 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E9] shrink-0">
          <div>
            <h3 className="text-2xl font-medium text-[#1D1F2C]">
              Query Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#F5F5F5] transition-colors duration-200 border border-[#777980]"
          >
            <X className="text-[#777980]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm lg:text-base text-[#777980] mb-3">
                Full Name
              </p>
              <p className="text-base lg:text-lg font-medium text-[#0B1220]">
                {data.full_name}
              </p>
            </div>
            <div>
              <p className="text-sm lg:text-base text-[#777980] mb-2">Date</p>
              <p className="text-base lg:text-lg font-medium text-[#0B1220]">
                {format(new Date(data.date), "d MMM, yyyy")}
              </p>
            </div>

            <div>
              <p className="text-sm lg:text-base text-[#777980] mb-2">
                Email Address
              </p>
              <div className="flex items-center gap-2 justify-between">
                <p className="text-base lg:text-lg font-medium">{data.email}</p>
                <button onClick={() => handleCopy(data.email, "Email")}>
                  <Copy className="w-5 h-5 text-[#b23730]" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm lg:text-base text-[#777980] mb-2">
                Phone Number
              </p>
              <div className="flex items-center gap-2 justify-between">
                <p className="text-base lg:text-lg font-medium">{data.phone}</p>
                <button onClick={() => handleCopy(data.phone, "Phone")}>
                  <Copy className="w-5 h-5 text-[#b23730]" />
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm lg:text-base text-[#777980] mb-2">
                  Vehicle
                </p>
                <p className="text-base font-medium text-[#0B1220]">
                  {data.vehicle}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm lg:text-base text-[#777980] mb-2">
                  Status
                </p>
                <FilterDropdown
                  label="Status"
                  options={[
                    { value: "new", label: "New" },
                    { value: "replied", label: "Replied" },
                    { value: "closed", label: "Closed" },
                  ]}
                  dropdownOffsetX={-80}
                  value={data.status}
                  onChange={(value) => onStatusChange?.(data.id, value || "")}
                  buttonClassName={`rounded-full border-none px-3 py-1.5 text-sm font-medium ${statusStyles[data.status] || ""}`}
                />
              </div>
            </div>

            {data.message && (
              <div className="mt-4 pt-4 border-t border-[#E8E8E9]">
                <p className="text-sm text-[#777980] mb-2">Message</p>
                <p className="text-base lg:text-lg text-[#0B1220] bg-[#F8F9FA] p-4 rounded-lg">
                  {data.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#E8E8E9] p-4 flex items-center gap-3 shrink-0">
          <button
            onClick={handleSendEmail}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0098E8] text-white rounded-lg hover:bg-[#0081C9] transition-colors duration-200 font-medium"
          >
            <Mail className="w-4 h-4" />
            Send E-mail
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFE6E6] text-[#FF4345] rounded-lg hover:bg-[#FFD4D4] transition-colors duration-200 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
