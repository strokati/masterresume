import type { Prisma } from '@prisma/client';

export type WorkCompanyWithRoles = Prisma.WorkCompanyGetPayload<{
	include: { roles: { include: { projects: true } } };
}>;

export type FullMasterResume = Prisma.MasterResumeGetPayload<{
	include: {
		workCompanies: { include: { roles: { include: { projects: true } } } };
		educations: true;
		skills: true;
		certifications: true;
		awards: true;
		projects: true;
		volunteeringRoles: true;
		publications: true;
	};
}>;
