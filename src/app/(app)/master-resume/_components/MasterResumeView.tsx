'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/master-resume/SectionCard';
import { ContactInfoForm } from '@/components/master-resume/ContactInfoForm';
import { TargetTitleForm } from '@/components/master-resume/TargetTitleForm';
import { SummaryEditor } from '@/components/master-resume/SummaryEditor';
import { WorkExperienceSection } from '@/components/master-resume/WorkExperienceSection';
import { EducationSection } from '@/components/master-resume/EducationSection';
import { SkillsSection } from '@/components/master-resume/SkillsSection';
import type { ContactInfoInput } from '@/lib/validations/master-resume';
import type { WorkCompanyWithRoles } from '@/types/master-resume';
import type { Education, Skill } from '@prisma/client';

export function MasterResumeView({
	resume,
	companies,
	education,
	skills,
}: {
	resume: {
		id: string;
		contactInfo?: unknown;
		targetTitle?: string | null;
		professionalSummary?: string | null;
	};
	companies: WorkCompanyWithRoles[];
	education: Education[];
	skills: Skill[];
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
			<EducationSection education={education} resumeId={resume.id} />
			<SkillsSection skills={skills} resumeId={resume.id} />
		</div>
	);
}
