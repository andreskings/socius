import { useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';

export default function CopyLinkButton({ posicion }) {
  const [copied, setCopied] = useState(false);
  const slug = posicion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleClick = () => {
    const url = `${window.location.origin}/postular/${slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      title="Copiar link de postulación"
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium ${
        copied ? 'bg-green-100 text-green-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
      {copied ? 'Link copiado' : 'Obtener link'}
    </button>
  );
}
