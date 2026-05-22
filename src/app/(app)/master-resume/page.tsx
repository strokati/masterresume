import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getOrCreateMasterResume, getWorkExperience } from '@/server/queries/master-resume';
import { MasterResumeView } from './_components/MasterResumeView';

export const dynamic = 'force-dynamic';

export default async function MasterResumePage() {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	const userId = session?.user?.id ?? 'local-user';

	const resume = await getOrCreateMasterResume(userId);
	const companies = await getWorkExperience(resume.id);

	return <MasterResumeView resume={resume} companies={companies} />;
}
