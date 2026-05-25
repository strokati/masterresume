'use client';

import { useState, useCallback } from 'react';
import { parsePartialJson } from 'ai';
import type { ImportedResumeData } from '@/lib/ai/prompts/import-resume';

type ProgressSection = {
	name: string;
	done: boolean;
};

const SECTION_NAMES = [
	'Contact Info',
	'Target Title',
	'Professional Summary',
	'Work Experience',
	'Education',
	'Skills',
	'Certifications',
	'Awards',
	'Projects',
	'Volunteering',
	'Publications',
];

function inferProgress(partial: Record<string, unknown>): ProgressSection[] {
	return SECTION_NAMES.map((name) => {
		const key = name === 'Work Experience' ? 'workCompanies'
			: name === 'Volunteering' ? 'volunteeringRoles'
			: name.replace(/\s/g, '').replace(/^./, (c) => c.toLowerCase());

		let done = false;
		if (key === 'contactInfo') done = !!partial.contactInfo && Object.values(partial.contactInfo as object).some(Boolean);
		else if (key === 'targetTitle') done = !!partial.targetTitle;
		else if (key === 'professionalSummary') done = !!partial.professionalSummary;
		else done = Array.isArray(partial[key]) && (partial[key] as unknown[]).length > 0;

		return { name, done };
	});
}

export function useImportResume() {
	const [result, setResult] = useState<ImportedResumeData | null>(null);
	const [partialResult, setPartialResult] = useState<ImportedResumeData | null>(null);
	const [progress, setProgress] = useState<ProgressSection[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const upload = useCallback(async (file: File, providerId: string) => {
		setIsLoading(true);
		setError(null);
		setResult(null);
		setPartialResult(null);
		setProgress(SECTION_NAMES.map((name) => ({ name, done: false })));

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('providerId', providerId);

			const res = await fetch('/api/ai/import-resume', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Import failed');
			}

			if (!res.body) throw new Error('No response body');

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let fullText = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				fullText += decoder.decode(value, { stream: true });

				// Try progressive parsing
				try {
					const { value: parsed } = await parsePartialJson(fullText);
					if (parsed && typeof parsed === 'object') {
						const data = parsed as ImportedResumeData;
						setPartialResult(data);
						setProgress(inferProgress(data as Record<string, unknown>));
					}
				} catch {
					// Partial JSON not parseable yet — that's fine
				}
			}

			// Final parse
			const jsonMatch = fullText.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]) as ImportedResumeData;
				setResult(parsed);
				setPartialResult(parsed);
				setProgress(inferProgress(parsed as Record<string, unknown>));
			} else {
				throw new Error('Could not parse import response');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Import failed');
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { upload, result, partialResult, isLoading, progress, error };
}
