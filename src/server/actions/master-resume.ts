'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import {
	ContactInfoSchema,
	CreateWorkCompanySchema,
	UpdateWorkCompanySchema,
	CreateWorkRoleSchema,
	UpdateWorkRoleSchema,
	CreateWorkProjectSchema,
	UpdateWorkProjectSchema,
	CreateEducationSchema,
	UpdateEducationSchema,
	CreateSkillSchema,
	UpdateSkillSchema,
	CreateCertificationSchema,
	UpdateCertificationSchema,
	CreateAwardSchema,
	UpdateAwardSchema,
	CreateProjectSchema,
	UpdateProjectSchema,
	CreateVolunteeringRoleSchema,
	UpdateVolunteeringRoleSchema,
	CreatePublicationSchema,
	UpdatePublicationSchema,
	ReorderSchema,
} from '@/lib/validations/master-resume';
import type {
	ContactInfoInput,
	CreateWorkCompanyInput,
	UpdateWorkCompanyInput,
	CreateWorkRoleInput,
	UpdateWorkRoleInput,
	CreateWorkProjectInput,
	UpdateWorkProjectInput,
	CreateEducationInput,
	UpdateEducationInput,
	CreateSkillInput,
	UpdateSkillInput,
	CreateCertificationInput,
	UpdateCertificationInput,
	CreateAwardInput,
	UpdateAwardInput,
	CreateProjectInput,
	UpdateProjectInput,
	CreateVolunteeringRoleInput,
	UpdateVolunteeringRoleInput,
	CreatePublicationInput,
	UpdatePublicationInput,
} from '@/lib/validations/master-resume';

async function requireAuth(): Promise<string> {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	return session?.user?.id ?? 'local-user';
}

// =============================================================================
// Contact Info, Target Title, Professional Summary
// =============================================================================

export async function updateContactInfo(resumeId: string, data: ContactInfoInput): Promise<void> {
	await requireAuth();
	const validated = ContactInfoSchema.parse(data);
	try {
		await db.masterResume.update({ where: { id: resumeId }, data: { contactInfo: validated } });
	} catch {
		throw new Error('Failed to update contact info.');
	}
	revalidatePath('/master-resume');
}

export async function updateTargetTitle(resumeId: string, targetTitle: string): Promise<void> {
	await requireAuth();
	const validated = z.string().parse(targetTitle);
	try {
		await db.masterResume.update({ where: { id: resumeId }, data: { targetTitle: validated } });
	} catch {
		throw new Error('Failed to update target title.');
	}
	revalidatePath('/master-resume');
}

export async function updateProfessionalSummary(resumeId: string, summary: string): Promise<void> {
	await requireAuth();
	const validated = z.string().parse(summary);
	try {
		await db.masterResume.update({
			where: { id: resumeId },
			data: { professionalSummary: validated },
		});
	} catch {
		throw new Error('Failed to update professional summary.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Work Companies
// =============================================================================

export async function createWorkCompany(
	resumeId: string,
	data: CreateWorkCompanyInput,
): Promise<ReturnType<typeof db.workCompany.create>> {
	await requireAuth();
	const validated = CreateWorkCompanySchema.parse(data);
	try {
		const count = await db.workCompany.count({ where: { resumeId } });
		return db.workCompany.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create company.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateWorkCompany(
	id: string,
	data: UpdateWorkCompanyInput,
): Promise<void> {
	await requireAuth();
	const validated = UpdateWorkCompanySchema.parse(data);
	try {
		await db.workCompany.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update company.');
	}
	revalidatePath('/master-resume');
}

export async function deleteWorkCompany(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.workCompany.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete company.');
	}
	revalidatePath('/master-resume');
}

export async function reorderWorkCompanies(
	resumeId: string,
	orderedIds: string[],
): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.workCompany.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder companies.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Work Roles
// =============================================================================

export async function createWorkRole(
	companyId: string,
	data: CreateWorkRoleInput,
): Promise<ReturnType<typeof db.workRole.create>> {
	await requireAuth();
	const validated = CreateWorkRoleSchema.parse(data);
	try {
		const count = await db.workRole.count({ where: { companyId } });
		return db.workRole.create({ data: { companyId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create role.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateWorkRole(id: string, data: UpdateWorkRoleInput): Promise<void> {
	await requireAuth();
	const validated = UpdateWorkRoleSchema.parse(data);
	try {
		await db.workRole.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update role.');
	}
	revalidatePath('/master-resume');
}

export async function deleteWorkRole(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.workRole.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete role.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Work Projects
// =============================================================================

export async function createWorkProject(
	roleId: string,
	data: CreateWorkProjectInput,
): Promise<ReturnType<typeof db.workProject.create>> {
	await requireAuth();
	const validated = CreateWorkProjectSchema.parse(data);
	try {
		const count = await db.workProject.count({ where: { roleId } });
		return db.workProject.create({ data: { roleId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create project.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateWorkProject(id: string, data: UpdateWorkProjectInput): Promise<void> {
	await requireAuth();
	const validated = UpdateWorkProjectSchema.parse(data);
	try {
		await db.workProject.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update project.');
	}
	revalidatePath('/master-resume');
}

export async function deleteWorkProject(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.workProject.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete project.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Education
// =============================================================================

export async function createEducation(
	resumeId: string,
	data: CreateEducationInput,
): Promise<ReturnType<typeof db.education.create>> {
	await requireAuth();
	const validated = CreateEducationSchema.parse(data);
	try {
		const count = await db.education.count({ where: { resumeId } });
		return db.education.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create education entry.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateEducation(id: string, data: UpdateEducationInput): Promise<void> {
	await requireAuth();
	const validated = UpdateEducationSchema.parse(data);
	try {
		await db.education.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update education entry.');
	}
	revalidatePath('/master-resume');
}

export async function deleteEducation(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.education.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete education entry.');
	}
	revalidatePath('/master-resume');
}

export async function reorderEducation(
	resumeId: string,
	orderedIds: string[],
): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.education.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder education entries.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Skills
// =============================================================================

export async function createSkill(
	resumeId: string,
	data: CreateSkillInput,
): Promise<ReturnType<typeof db.skill.create>> {
	await requireAuth();
	const validated = CreateSkillSchema.parse(data);
	try {
		const count = await db.skill.count({ where: { resumeId } });
		return db.skill.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create skill.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateSkill(id: string, data: UpdateSkillInput): Promise<void> {
	await requireAuth();
	const validated = UpdateSkillSchema.parse(data);
	try {
		await db.skill.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update skill.');
	}
	revalidatePath('/master-resume');
}

export async function deleteSkill(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.skill.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete skill.');
	}
	revalidatePath('/master-resume');
}

export async function reorderSkills(resumeId: string, orderedIds: string[]): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.skill.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder skills.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Certifications
// =============================================================================

export async function createCertification(
	resumeId: string,
	data: CreateCertificationInput,
): Promise<ReturnType<typeof db.certification.create>> {
	await requireAuth();
	const validated = CreateCertificationSchema.parse(data);
	try {
		const count = await db.certification.count({ where: { resumeId } });
		return db.certification.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create certification.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateCertification(
	id: string,
	data: UpdateCertificationInput,
): Promise<void> {
	await requireAuth();
	const validated = UpdateCertificationSchema.parse(data);
	try {
		await db.certification.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update certification.');
	}
	revalidatePath('/master-resume');
}

export async function deleteCertification(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.certification.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete certification.');
	}
	revalidatePath('/master-resume');
}

export async function reorderCertifications(
	resumeId: string,
	orderedIds: string[],
): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.certification.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder certifications.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Awards
// =============================================================================

export async function createAward(
	resumeId: string,
	data: CreateAwardInput,
): Promise<ReturnType<typeof db.award.create>> {
	await requireAuth();
	const validated = CreateAwardSchema.parse(data);
	try {
		const count = await db.award.count({ where: { resumeId } });
		return db.award.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create award.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateAward(id: string, data: UpdateAwardInput): Promise<void> {
	await requireAuth();
	const validated = UpdateAwardSchema.parse(data);
	try {
		await db.award.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update award.');
	}
	revalidatePath('/master-resume');
}

export async function deleteAward(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.award.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete award.');
	}
	revalidatePath('/master-resume');
}

export async function reorderAwards(resumeId: string, orderedIds: string[]): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.award.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder awards.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Projects (personal / open-source)
// =============================================================================

export async function createProject(
	resumeId: string,
	data: CreateProjectInput,
): Promise<ReturnType<typeof db.project.create>> {
	await requireAuth();
	const validated = CreateProjectSchema.parse(data);
	try {
		const count = await db.project.count({ where: { resumeId } });
		return db.project.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create project.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<void> {
	await requireAuth();
	const validated = UpdateProjectSchema.parse(data);
	try {
		await db.project.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update project.');
	}
	revalidatePath('/master-resume');
}

export async function deleteProject(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.project.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete project.');
	}
	revalidatePath('/master-resume');
}

export async function reorderProjects(resumeId: string, orderedIds: string[]): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.project.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder projects.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Volunteering Roles
// =============================================================================

export async function createVolunteeringRole(
	resumeId: string,
	data: CreateVolunteeringRoleInput,
): Promise<ReturnType<typeof db.volunteeringRole.create>> {
	await requireAuth();
	const validated = CreateVolunteeringRoleSchema.parse(data);
	try {
		const count = await db.volunteeringRole.count({ where: { resumeId } });
		return db.volunteeringRole.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create volunteering role.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updateVolunteeringRole(
	id: string,
	data: UpdateVolunteeringRoleInput,
): Promise<void> {
	await requireAuth();
	const validated = UpdateVolunteeringRoleSchema.parse(data);
	try {
		await db.volunteeringRole.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update volunteering role.');
	}
	revalidatePath('/master-resume');
}

export async function deleteVolunteeringRole(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.volunteeringRole.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete volunteering role.');
	}
	revalidatePath('/master-resume');
}

export async function reorderVolunteeringRoles(
	resumeId: string,
	orderedIds: string[],
): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.volunteeringRole.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder volunteering roles.');
	}
	revalidatePath('/master-resume');
}

// =============================================================================
// Publications
// =============================================================================

export async function createPublication(
	resumeId: string,
	data: CreatePublicationInput,
): Promise<ReturnType<typeof db.publication.create>> {
	await requireAuth();
	const validated = CreatePublicationSchema.parse(data);
	try {
		const count = await db.publication.count({ where: { resumeId } });
		return db.publication.create({ data: { resumeId, ...validated, order: count } });
	} catch {
		throw new Error('Failed to create publication.');
	} finally {
		revalidatePath('/master-resume');
	}
}

export async function updatePublication(
	id: string,
	data: UpdatePublicationInput,
): Promise<void> {
	await requireAuth();
	const validated = UpdatePublicationSchema.parse(data);
	try {
		await db.publication.update({ where: { id }, data: validated });
	} catch {
		throw new Error('Failed to update publication.');
	}
	revalidatePath('/master-resume');
}

export async function deletePublication(id: string): Promise<void> {
	await requireAuth();
	try {
		await db.publication.delete({ where: { id } });
	} catch {
		throw new Error('Failed to delete publication.');
	}
	revalidatePath('/master-resume');
}

export async function reorderPublications(
	resumeId: string,
	orderedIds: string[],
): Promise<void> {
	await requireAuth();
	const validated = ReorderSchema.parse(orderedIds);
	try {
		await db.$transaction(
			validated.map((itemId, order) =>
				db.publication.update({ where: { id: itemId }, data: { order } }),
			),
		);
	} catch {
		throw new Error('Failed to reorder publications.');
	}
	revalidatePath('/master-resume');
}
