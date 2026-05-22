'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/master-resume/SectionCard';
import { ContactInfoForm } from '@/components/master-resume/ContactInfoForm';
import { TargetTitleForm } from '@/components/master-resume/TargetTitleForm';
import { SummaryEditor } from '@/components/master-resume/SummaryEditor';
import { WorkExperienceSection } from '@/components/master-resume/WorkExperienceSection';
import type { ContactInfoInput } from '@/lib/validations/master-resume';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

export function MasterResumeView({
	resume,
	companies,
}: {
	resume: {
		id: string;
		contactInfo?: unknown;
		targetTitle?: string | null;
		professionalSummary?: string | null;
	};
	companies: WorkCompanyWithRoles[];
}) {
	const contactInfo = (resume.contactInfo as ContactInfoInput | null) ?? undefined;

	return (
		<div className="space-y-6">
			<PageHeader title="Master Resume" description="Your complete career history — the single source of truth." />

			<SectionCard title="Contact Information">
				<ContactInfoForm resumeId={resume.id} defaultValues={contactInfo} />
			</SectionCard>

			<SectionCard title="Target Title">
				<TargetTitleForm resumeId={resume.id} defaultValue={resume.targetTitle} />
			</SectionCard>

			<SectionCard title="Professional Summary" collapsible>
				<SummaryEditor resumeId={resume.id} defaultValue={resume.professionalSummary} />
			</SectionCard>

			<WorkExperienceSection companies={companies} resumeId={resume.id} />
		</div>
	);
}
