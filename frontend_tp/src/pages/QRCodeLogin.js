import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

const QRCodeLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedQR, setDetectedQR] = useState(null);
  const [jsQRLoaded, setJsQRLoaded] = useState(false);

  // Carregar jsQR
  useEffect(() => {
    if (!window.jsQR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
      script.async = true;
      script.onload = () => {
        setJsQRLoaded(true);
        console.log('jsQR carregado');
      };
      script.onerror = () => {
        console.error('Erro ao carregar jsQR');
        toast.error('Erro ao carregar leitor de QR Code');
      };
      document.body.appendChild(script);
    } else {
      setJsQRLoaded(true);
    }
  }, []);

  // Verificar se veio de um QR Code
  useEffect(() => {
    const qrData = searchParams.get('token');
    if (qrData) {
      console.log('QR Data recebida:', qrData);
      handleQRCodeData(qrData);
    }
  }, [searchParams]);

  const startCamera = async () => {
    try {
      setLoading(true);
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        // Aguardar um pouco para a câmera carregar
        setTimeout(() => {
          if (jsQRLoaded) {
            scanQRCode();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao aceder à câmera:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Permissão de câmera negada. Verifique as definições do navegador.');
      } else if (error.name === 'NotFoundError') {
        toast.error('Nenhuma câmera encontrada neste dispositivo.');
      } else {
        toast.error('Não foi possível aceder à câmera.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || !isCameraActive || !jsQRLoaded) return;

    const ctx = canvas.getContext('2d');
    
    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          if (window.jsQR) {
            const code = window.jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && code.data && !detectedQR) {
              console.log('QR Code detectado:', code.data);
              setDetectedQR(code.data);
              handleQRCodeData(code.data);
              stopCamera();
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao processar QR Code:', error);
        }
      }

      if (isCameraActive) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const handleQRCodeData = async (data) => {
    try {
      setLoading(true);
      setScanResult(data);

      // O QR Code contém a URL com o token
      // Extrair o token da URL
      let token = data;
      
      try {
        const url = new URL(data);
        token = url.searchParams.get('token') || data;
      } catch (e) {
        // Se não for uma URL, usar diretamente
        token = data;
      }

      console.log('Token extraído:', token);

      // Fazer login com o token do QR Code
      const response = await fetch(`http://localhost:3000/api/auth/qr-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrToken: token })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login com QR Code');
      }

      // Login bem-sucedido
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      toast.success('Login com QR Code bem-sucedido!');
      
      // Redirecionar conforme o papel do utilizador
      if (result.user.role === 'PT') {
        navigate('/my-clients');
      } else if (result.user.role === 'CLIENT') {
        navigate('/my-workouts');
      } else if (result.user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erro no login com QR Code:', error);
      toast.error(error.message || 'Erro ao fazer login com QR Code');
      setScanResult(null);
      setDetectedQR(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isCameraActive) {
    return <Loading text="Processando QR Code..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              QR Code Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Digitalize o código QR para entrar na sua conta
            </p>
          </div>

          {!isCameraActive ? (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Clique no botão abaixo para iniciar a câmera
                </p>
              </div>

              <Button
                onClick={startCamera}
                disabled={loading || !jsQRLoaded}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-400"
              >
                {loading ? 'A ativar câmera...' : !jsQRLoaded ? 'A carregar...' : 'Iniciar Câmera'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    ou
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                className="w-full"
              >
                Voltar ao Login Normal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden w-full" style={{ maxHeight: '400px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-96 object-cover"
                  style={{ maxHeight: '300px' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Overlay com guia de enquadramento */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-primary-400 rounded-lg"></div>
                </div>

                {/* Indicador de status */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="text-center">
                    <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
                      <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      A digitalizar...
                    </span>
                  </div>
                </div>
              </div>

              {scanResult && (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    QR Code detectado! A entrar...
                  </p>
                </div>
              )}

              <Button
                onClick={() => {
                  stopCamera();
                  setScanResult(null);
                  setDetectedQR(null);
                }}
                variant="secondary"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRCodeLogin;