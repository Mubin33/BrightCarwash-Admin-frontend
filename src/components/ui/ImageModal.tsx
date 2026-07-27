'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Image as ImageIcon } from 'lucide-react';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (url: string) => void;
    initialUrl?: string;
}

export function ImageModal({ isOpen, onClose, onSave, initialUrl = '' }: ImageModalProps) {
    const [url, setUrl] = useState(initialUrl);
    const [preview, setPreview] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl(initialUrl);
            setPreview(initialUrl);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialUrl]);

    useEffect(() => {
        if (url.trim() && (url.startsWith('http://') || url.startsWith('https://'))) {
            setPreview(url.trim());
        } else {
            setPreview('');
        }
    }, [url]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSave(url.trim());
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Insert Image" size="lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-sm font-medium leading-5">
                        Image URL
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <ImageIcon size={18} className="text-[#777980]" />
                        </div>
                        <input
                            ref={inputRef}
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/20 transition-all"
                            autoFocus
                        />
                    </div>
                    <p className="text-[#A5A5AB] font-inter text-xs leading-4">
                        Enter a valid image URL. Supports JPG, PNG, GIF, WebP, SVG.
                    </p>
                </div>

                {/* Image Preview */}
                {preview && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[#777980] font-inter text-sm font-medium leading-5">
                            Preview
                        </label>
                        <div className="relative w-full aspect-video max-h-[200px] rounded-lg overflow-hidden bg-[#F8FAFB] border border-[#DFE1E7]">
                            <img
                                src={preview}
                                alt="Image preview"
                                className="w-full h-full object-contain"
                                onError={() => setPreview('')}
                            />
                        </div>
                    </div>
                )}

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
                        Insert Image
                    </Button>
                </div>
            </form>
        </Modal>
    );
}