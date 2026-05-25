import { auth } from '@/lib/auth/config';
import { importResume } from '@/lib/ai/operations/import-resume';
import { NextRequest } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest) {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') {
		return new Response('Unauthorized', { status: 401 });
	}
	const userId = session?.user?.id ?? 'local-user';

	const formData = await req.formData();
	const file = formData.get('file') as File | null;
	const providerId = formData.get('providerId') as string | null;

	if (!file) {
		return new Response('No file uploaded', { status: 400 });
	}
	if (!providerId) {
		return new Response('Missing providerId', { status: 400 });
	}
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return new Response('Only PDF and DOCX files are accepted', { status: 400 });
	}
	if (file.size > MAX_FILE_SIZE) {
		return new Response('File too large. Maximum size is 5 MB.', { status: 413 });
	}

	let fileText: string;

	if (file.type === 'application/pdf') {
		const buffer = Buffer.from(await file.arrayBuffer());
		const pdfParse = (await import('pdf-parse')) as unknown as { (buf: Buffer): Promise<{ text: string }> };
		const parsed = await pdfParse(buffer);
		fileText = parsed.text;
	} else {
		const buffer = Buffer.from(await file.arrayBuffer());
		const mammoth = await import('mammoth');
		const result = await mammoth.extractRawText({ buffer });
		fileText = result.value;
	}

	if (!fileText.trim()) {
		return new Response('Could not extract text from file. It may be empty or image-based.', { status: 400 });
	}

	try {
		const streamResult = await importResume(userId, fileText, providerId);
		return streamResult.toTextStreamResponse();
	} catch (err) {
		return new Response(
			err instanceof Error ? err.message : 'Import failed',
			{ status: 500 },
		);
	}
}
