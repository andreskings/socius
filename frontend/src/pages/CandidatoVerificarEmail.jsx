import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { api } from '../api/client';

export default function CandidatoVerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // 'verificando' | 'ok' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setEstado('error');
      return;
    }
    api
      .verificarEmailCandidato(token)
      .then(() => setEstado('ok'))
      .catch(() => setEstado('error'));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-lg p-8 text-center">
        {estado === 'verificando' && <p className="text-sm text-gray-500">Verificando tu correo...</p>}
        {estado === 'ok' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800 mb-2">Correo verificado</h1>
            <p className="text-sm text-gray-500 mb-6">Ya podés postular a búsquedas abiertas.</p>
            <button
              onClick={() => navigate('/candidato/portal')}
              className="px-6 py-2.5 bg-[#0f1b2d] text-white rounded-xl text-sm hover:bg-[#1a2f4a] transition-colors"
            >
              Ir a mi portal
            </button>
          </>
        )}
        {estado === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800 mb-2">Link inválido o vencido</h1>
            <p className="text-sm text-gray-500">Pedí un nuevo link de verificación desde tu portal.</p>
          </>
        )}
      </div>
    </div>
  );
}
