import { redirect } from 'next/navigation';
// Tempo's is samengevoegd met de calculator; oude links (ook /tempo#threshold) komen daar uit.
export default function Tempo() { redirect('/tools'); }
