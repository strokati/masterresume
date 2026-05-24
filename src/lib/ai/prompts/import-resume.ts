import { z } from 'zod';

export const IMPORT_RESUME_SYSTEM = `You are an expert resume parser. Extract all information from the provided resume text into a structured JSON object.

Rules:
- Extract every piece of information you can find. Be thorough.
- If responsibilities or achievements are vague, rewrite them as action-verb-led bullet points.
- If technologies used are implied or inferable, add them.
- Dates should be in a flexible format as they appear (e.g. "Jan 2020", "2020-01", "2020").
- If a field is not mentioned, omit it or leave it empty.
- Group skills into logical categories (e.g. "Programming Languages", "Frameworks", "Tools", "Languages", "Interests").
- The contactInfo object should capture all personal details found at the top of the resume.`;

export const ImportedResumeSchema = z.object({
	contactInfo: z.object({
		name: z.string().optional(),
		email: z.string().optional(),
		phone: z.string().optional(),
		location: z.string().optional(),
		linkedin: z.string().optional(),
		github: z.string().optional(),
		website: z.string().optional(),
	}).optional(),
	targetTitle: z.string().optional(),
	professionalSummary: z.string().optional(),
	workCompanies: z.array(z.object({
		name: z.string(),
		location: z.string().optional(),
		employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance']).optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		roles: z.array(z.object({
			title: z.string(),
			startDate: z.string().optional(),
			endDate: z.string().optional(),
			responsibilities: z.array(z.string()).optional(),
			achievements: z.array(z.string()).optional(),
			technologies: z.array(z.string()).optional(),
			projects: z.array(z.object({
				name: z.string(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				description: z.string().optional(),
				contribution: z.string().optional(),
				technologies: z.array(z.string()).optional(),
				outcome: z.string().optional(),
			})).optional(),
		})),
	})).optional(),
	educations: z.array(z.object({
		institution: z.string(),
		degree: z.string().optional(),
		field: z.string().optional(),
		location: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		gpa: z.string().optional(),
		honors: z.string().optional(),
		activities: z.array(z.string()).optional(),
	})).optional(),
	skills: z.array(z.object({
		name: z.string(),
		category: z.string().optional(),
		level: z.enum(['Beginner', 'Intermediate', 'Expert']).optional(),
	})).optional(),
	certifications: z.array(z.object({
		name: z.string(),
		issuer: z.string().optional(),
		issueDate: z.string().optional(),
		expiryDate: z.string().optional(),
		credentialId: z.string().optional(),
		url: z.string().optional(),
	})).optional(),
	awards: z.array(z.object({
		title: z.string(),
		issuer: z.string().optional(),
		date: z.string().optional(),
		description: z.string().optional(),
	})).optional(),
	projects: z.array(z.object({
		name: z.string(),
		description: z.string().optional(),
		role: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		technologies: z.array(z.string()).optional(),
		url: z.string().optional(),
		repoUrl: z.string().optional(),
	})).optional(),
	volunteeringRoles: z.array(z.object({
		organization: z.string(),
		role: z.string().optional(),
		location: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		responsibilities: z.array(z.string()).optional(),
	})).optional(),
	publications: z.array(z.object({
		title: z.string(),
		authors: z.string().optional(),
		publisher: z.string().optional(),
		date: z.string().optional(),
		url: z.string().optional(),
		doi: z.string().optional(),
		description: z.string().optional(),
	})).optional(),
});

export type ImportedResumeData = z.infer<typeof ImportedResumeSchema>;

export function getSectionCounts(data: ImportedResumeData): Record<string, number> {
	return {
		'Contact Info': data.contactInfo ? Object.values(data.contactInfo).filter(Boolean).length : 0,
		'Target Title': data.targetTitle ? 1 : 0,
		'Professional Summary': data.professionalSummary ? 1 : 0,
		'Work Companies': data.workCompanies?.length ?? 0,
		'Work Roles': data.workCompanies?.reduce((sum, c) => sum + c.roles.length, 0) ?? 0,
		Education: data.educations?.length ?? 0,
		Skills: data.skills?.length ?? 0,
		Certifications: data.certifications?.length ?? 0,
		Awards: data.awards?.length ?? 0,
		Projects: data.projects?.length ?? 0,
		Volunteering: data.volunteeringRoles?.length ?? 0,
		Publications: data.publications?.length ?? 0,
	};
}
