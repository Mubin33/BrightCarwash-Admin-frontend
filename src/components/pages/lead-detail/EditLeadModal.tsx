// "use client";

// import { useState, useEffect } from "react";
// import { Modal } from "@/components/ui/Modal";
// import { Button } from "@/components/ui/Button";
// import { FilterDropdown } from "@/components/ui/FilterDropdown";
// import type { LeadDetail } from "@/types/lead-detail";
// import type { StageOption } from "@/components/ui/StageDropdown";

// interface EditLeadModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     lead: LeadDetail;
//     stages: StageOption[];
//     onSave: (data: any) => Promise<void>;
// }

// const PRIORITY_OPTIONS = [
//     { value: 'LOW', label: 'Low' },
//     { value: 'MEDIUM', label: 'Medium' },
//     { value: 'HIGH', label: 'High' },
//     { value: 'URGENT', label: 'Urgent' },
// ];

// export function EditLeadModal({
//     isOpen,
//     onClose,
//     lead,
//     stages,
//     onSave,
// }: EditLeadModalProps) {
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         phone: '',
//         service: '',
//         vehicle: '',
//         source: '',
//         priority: 'MEDIUM',
//         deposit_status: 'NONE',
//         stage_name: '',
//     });
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     useEffect(() => {
//         if (lead && isOpen) {
//             setFormData({
//                 name: lead.name || '',
//                 email: lead.email || '',
//                 phone: lead.phone || '',
//                 service: lead.service || '',
//                 vehicle: lead.vehicle || '',
//                 source: lead.source || '',
//                 priority: lead.priority || 'MEDIUM',
//                 deposit_status: lead.depositStatus || 'NONE',
//                 stage_name: lead.stage || '',
//             });
//         }
//     }, [lead, isOpen]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//         try {
//             await onSave(formData);
//             onClose();
//         } catch (error) {
//             console.error('Save error:', error);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const inputClass =
//         "w-full px-4 py-2.5 text-sm font-inter border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all";

//     const stageOptions = stages.map((s) => ({
//         value: s.value,
//         label: s.label,
//     }));

//     const priorityOptions = PRIORITY_OPTIONS.map((p) => ({
//         value: p.value,
//         label: p.label,
//     }));

//     // Get current priority label for display
//     const currentPriority = formData.priority || 'MEDIUM';
//     const currentPriorityLabel = PRIORITY_OPTIONS.find(p => p.value === currentPriority)?.label || 'Medium';

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead" size="lg">
//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Name</label>
//                         <input
//                             type="text"
//                             value={formData.name}
//                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                             className={inputClass}
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Email</label>
//                         <input
//                             type="email"
//                             value={formData.email}
//                             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                             className={inputClass}
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Phone</label>
//                         <input
//                             type="tel"
//                             value={formData.phone}
//                             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                             className={inputClass}
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Source</label>
//                         <input
//                             type="text"
//                             value={formData.source}
//                             onChange={(e) => setFormData({ ...formData, source: e.target.value })}
//                             className={inputClass}
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Service</label>
//                         <input
//                             type="text"
//                             value={formData.service}
//                             onChange={(e) => setFormData({ ...formData, service: e.target.value })}
//                             className={inputClass}
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Vehicle</label>
//                         <input
//                             type="text"
//                             value={formData.vehicle}
//                             onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
//                             className={inputClass}
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Priority</label>
//                         <FilterDropdown
//                             label="Priority"
//                             options={priorityOptions}
//                             value={formData.priority}
//                             onChange={(val) => setFormData({ ...formData, priority: val })}
//                             fullWidth
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Deposit Status</label>
//                         <FilterDropdown
//                             label="Status"
//                             options={[
//                                 { value: 'PAID', label: 'Paid' },
//                                 { value: 'PENDING', label: 'Pending' },
//                                 { value: 'REFUNDED', label: 'Refunded' },
//                                 { value: 'NONE', label: 'None' },
//                             ]}
//                             value={formData.deposit_status}
//                             onChange={(val) => setFormData({ ...formData, deposit_status: val })}
//                             fullWidth
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Stage</label>
//                         <FilterDropdown
//                             label="Stage"
//                             options={stageOptions}
//                             value={formData.stage_name}
//                             onChange={(val) => setFormData({ ...formData, stage_name: val })}
//                             fullWidth
//                             scrollable
//                         />
//                     </div>
//                 </div>

//                 <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-[#E8E8E9]">
//                     <Button type="button" variant="outline" onClick={onClose} className="px-6">
//                         Cancel
//                     </Button>
//                     <Button
//                         type="submit"
//                         isLoading={isSubmitting}
//                         loadingText="Saving..."
//                         className="px-6"
//                     >
//                         Save Changes
//                     </Button>
//                 </div>
//             </form>
//         </Modal>
//     );
// }


'use client';

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import type { LeadDetail } from "@/types/lead-detail";
import type { StageOption } from "@/components/ui/StageDropdown";

interface EditLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: LeadDetail;
    stages: StageOption[];
    onSave: (data: any) => Promise<void>;
}

const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

export function EditLeadModal({
    isOpen,
    onClose,
    lead,
    stages,
    onSave,
}: EditLeadModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        vehicle: '',
        source: '',
        priority: 'MEDIUM',
        deposit_status: 'NONE',
        stage_name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (lead && isOpen) {
            setFormData({
                name: lead.name || '',
                email: lead.email || '',
                phone: lead.phone || '',
                service: lead.service || '',
                vehicle: lead.vehicle || '',
                source: lead.source || '',
                priority: lead.priority || 'MEDIUM',
                deposit_status: lead.depositStatus || 'NONE',
                // ✅ Use the actual stage name directly (e.g., "Post Lead")
                stage_name: lead.stage || '',
            });
        }
    }, [lead, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // ✅ stage_name is already the actual name (e.g., "Post Lead")
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-4 py-2.5 text-sm font-inter border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all";

    // ✅ Use stage.label as both value and label
    const stageOptions = stages.map((s) => ({
        value: s.label,  // Use the actual stage name as value
        label: s.label,
    }));

    const priorityOptions = PRIORITY_OPTIONS.map((p) => ({
        value: p.value,
        label: p.label,
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead" size="lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Source</label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Service</label>
                        <input
                            type="text"
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Vehicle</label>
                        <input
                            type="text"
                            value={formData.vehicle}
                            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Priority</label>
                        <FilterDropdown
                            label="Priority"
                            options={priorityOptions}
                            value={formData.priority}
                            onChange={(val) => setFormData({ ...formData, priority: val })}
                            fullWidth
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Deposit Status</label>
                        <FilterDropdown
                            label="Status"
                            options={[
                                { value: 'PAID', label: 'Paid' },
                                { value: 'PENDING', label: 'Pending' },
                                { value: 'REFUNDED', label: 'Refunded' },
                                { value: 'NONE', label: 'None' },
                            ]}
                            value={formData.deposit_status}
                            onChange={(val) => setFormData({ ...formData, deposit_status: val })}
                            fullWidth
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Stage</label>
                        <FilterDropdown
                            label="Stage"
                            options={stageOptions}
                            value={formData.stage_name}  // ✅ The actual stage name
                            onChange={(val) => setFormData({ ...formData, stage_name: val })}
                            fullWidth
                            scrollable
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-[#E8E8E9]">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                        className="px-6"
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}