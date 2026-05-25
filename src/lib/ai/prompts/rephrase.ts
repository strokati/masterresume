export type RephraseDirection = 'stronger' | 'concise' | 'quantified' | 'formal' | 'casual';

const DIRECTION_INSTRUCTIONS: Record<RephraseDirection, string> = {
	stronger: 'Make this bullet point more impactful. Use strong action verbs (e.g. Spearheaded, Architected, Drove). Be bold and emphasize outcomes.',
	concise: 'Rewrite this bullet point to be shorter while keeping the same meaning. Remove filler words. Aim for 50-70% of the original length.',
	quantified: 'Add or suggest specific metrics, numbers, or quantifiable results to this bullet point. If no exact number is known, suggest realistic ones in brackets like [X%].',
	formal: 'Rewrite this bullet point in a more professional, formal tone. Remove casual language and colloquialisms.',
	casual: 'Rewrite this bullet point to sound more natural and conversational. Less stiff, more approachable, while remaining appropriate for a resume.',
};

export function buildRephrasePrompt(original: string, direction: RephraseDirection, context: string): string {
	return `${DIRECTION_INSTRUCTIONS[direction]}

Context: The person's role is "${context}".

Original bullet:
${original}

Rewrite the bullet point. Return ONLY the rewritten text, nothing else.`;
}
