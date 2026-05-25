import { db } from '@/lib/db/client';
import type { WorkCompanyWithRoles, FullMasterResume } from '@/types/master-resume';

export async function getOrCreateMasterResume(userId: string) {
	await db.user.upsert({
		where: { id: userId },
		update: {},
		create: { id: userId, email: userId === 'local-user' ? 'local@localhost' : '' },
	});

	let resume = await db.masterResume.findUnique({ where: { userId } });
	if (!resume) {
		resume = await db.masterResume.create({ data: { userId } });
	}
	return resume;
}

export async function getWorkExperience(resumeId: string): Promise<WorkCompanyWithRoles[]> {
	return db.workCompany.findMany({
		where: { resumeId },
		include: { roles: { include: { projects: true }, orderBy: { order: 'asc' } } },
		orderBy: { order: 'asc' },
	});
}

export async function getEducation(resumeId: string) {
	return db.education.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getSkills(resumeId: string) {
	return db.skill.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getCertifications(resumeId: string) {
	return db.certification.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getAwards(resumeId: string) {
	return db.award.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getProjects(resumeId: string) {
	return db.project.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getVolunteeringRoles(resumeId: string) {
	return db.volunteeringRole.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getPublications(resumeId: string) {
	return db.publication.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getFullMasterResume(userId: string): Promise<FullMasterResume> {
	const resume = await getOrCreateMasterResume(userId);
	const full = await db.masterResume.findUniqueOrThrow({
		where: { id: resume.id },
		include: {
			workCompanies: {
				include: { roles: { include: { projects: true }, orderBy: { order: 'asc' } } },
				orderBy: { order: 'asc' },
			},
			educations: { orderBy: { order: 'asc' } },
			skills: { orderBy: { order: 'asc' } },
			certifications: { orderBy: { order: 'asc' } },
			awards: { orderBy: { order: 'asc' } },
			projects: { orderBy: { order: 'asc' } },
			volunteeringRoles: { orderBy: { order: 'asc' } },
			publications: { orderBy: { order: 'asc' } },
		},
	});
	return full;
}
