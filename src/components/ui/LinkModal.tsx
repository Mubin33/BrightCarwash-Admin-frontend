'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Link2 } from 'lucide-react';

interface LinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (url: string) => void;
    initialUrl?: string;
}

export function LinkModal({ isOpen, onClose, onSave, initialUrl = '' }: LinkModalProps) {
    const [url, setUrl] = useState(initialUrl);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl(initialUrl);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            let finalUrl = url.trim();
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = `https://${finalUrl}`;
            }
            onSave(finalUrl);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Insert Link" size="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-sm font-medium leading-5">
                        URL
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Link2 size={18} className="text-[#777980]" />
                        </div>
                        <input
                            ref={inputRef}
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/20 transition-all"
                            autoFocus
                        />
                    </div>
                    <p className="text-[#A5A5AB] font-inter text-xs leading-4">
                        Enter a valid URL. http:// or https:// will be added automatically.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-2.5"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!url.trim()}
                        className="flex-1 py-2.5 bg-[#0098E8] text-white hover:bg-[#0088D8] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Link
                    </Button>
                </div>
            </form>
        </Modal>
    );
}