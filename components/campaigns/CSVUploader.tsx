'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheck, FiX, FiAlertCircle, FiFile } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface CSVUploaderProps {
    onUploadSuccess: (addresses: string[]) => void;
    onError?: (error: string) => void;
}

export default function CSVUploader({ onUploadSuccess, onError }: CSVUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        // Validate file type
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            const errorMsg = 'Please upload a CSV or TXT file';
            setUploadResult({ error: errorMsg });
            onError?.(errorMsg);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            const errorMsg = 'File size must be less than 5MB';
            setUploadResult({ error: errorMsg });
            onError?.(errorMsg);
            return;
        }

        setIsUploading(true);
        setUploadResult(null);

        try {
            const text = await file.text();

            // Call backend API
            const response = await fetch('/api/campaigns/upload-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvData: text }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadResult(data.data);
            onUploadSuccess(data.data.validAddresses);
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to process CSV file';
            setUploadResult({ error: errorMsg });
            onError?.(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleReset = () => {
        setUploadResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {!uploadResult ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Card
                                variant="glass"
                                padding="lg"
                                className={`
                border-2 border-dashed transition-all duration-200
                ${isDragging
                                        ? 'border-white bg-white/10'
                                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                                    }
              `}
                            >
                                <div className="text-center py-8">
                                    <motion.div
                                        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-elevated)] mb-4"
                                    >
                                        <FiUpload className="w-8 h-8 text-[var(--text-secondary)]" />
                                    </motion.div>

                                    <h3 className="text-lg font-semibold mb-2">
                                        {isDragging ? 'Drop CSV file here' : 'Upload Wallet Addresses'}
                                    </h3>
                                    <p className="text-sm text-[var(--text-tertiary)] mb-6">
                                        Drag & drop your CSV file or browse to upload
                                    </p>

                                    <div className="flex items-center justify-center gap-3">
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={handleBrowseClick}
                                            isLoading={isUploading}
                                        >
                                            Browse Files
                                        </Button>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                                        <p className="text-xs text-[var(--text-tertiary)] mb-2">
                                            <strong>Format:</strong> CSV/TSV with wallet addresses in first column
                                        </p>
                                        <p className="text-xs text-[var(--text-tertiary)]">
                                            <strong>Max:</strong> 10,000 addresses • <strong>File size:</strong> Up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {uploadResult.error ? (
                            <Card variant="luxury" padding="lg" className="border-[var(--color-error)]">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
                                            <FiX className="w-6 h-6 text-[var(--color-error)]" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--color-error)] mb-1">Upload Failed</h4>
                                        <p className="text-sm text-[var(--text-secondary)]">{uploadResult.error}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleReset}>
                                        Try Again
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card variant="luxury" padding="lg" className="border-[var(--color-success)]">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                                            <FiCheck className="w-6 h-6 text-[var(--color-success)]" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--color-success)] mb-1">Upload Successful</h4>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            CSV file processed and validated successfully
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleReset}>
                                        Replace
                                    </Button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
                                        <div className="text-xs text-[var(--text-tertiary)] mb-1">Valid Addresses</div>
                                        <div className="text-2xl font-bold text-[var(--color-success)]">
                                            {uploadResult.totalValid.toLocaleString()}
                                        </div>
                                    </div>
                                    {uploadResult.totalInvalid > 0 && (
                                        <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
                                            <div className="text-xs text-[var(--text-tertiary)] mb-1">Invalid</div>
                                            <div className="text-2xl font-bold text-[var(--color-error)]">
                                                {uploadResult.totalInvalid}
                                            </div>
                                        </div>
                                    )}
                                    {uploadResult.duplicatesRemoved > 0 && (
                                        <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
                                            <div className="text-xs text-[var(--text-tertiary)] mb-1">Duplicates Removed</div>
                                            <div className="text-2xl font-bold text-[var(--color-warning)]">
                                                {uploadResult.duplicatesRemoved}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[var(--text-tertiary)]">
                                            Preview (first 10 addresses)
                                        </span>
                                        <Badge variant="default" size="sm">
                                            {uploadResult.totalValid} total
                                        </Badge>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 max-h-40 overflow-y-auto">
                                        {uploadResult.validAddresses.slice(0, 10).map((address: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="font-mono text-xs text-[var(--text-secondary)] py-1 flex items-center gap-2"
                                            >
                                                <FiCheck className="w-3 h-3 text-[var(--color-success)] flex-shrink-0" />
                                                {address}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Invalid addresses warning */}
                                {uploadResult.invalidAddresses && uploadResult.invalidAddresses.length > 0 && (
                                    <div className="mt-4 p-3 bg-[var(--color-warning)]/10 rounded-lg border border-[var(--color-warning)]/20">
                                        <div className="flex items-start gap-2">
                                            <FiAlertCircle className="w-4 h-4 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-[var(--color-warning)] mb-1">
                                                    Invalid Addresses Detected
                                                </p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    {uploadResult.totalInvalid} invalid addresses were removed. First few:
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    {uploadResult.invalidAddresses.map((addr: string, idx: number) => (
                                                        <div key={idx} className="font-mono text-xs text-[var(--color-warning)]">
                                                            {addr}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
