import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../services/api';
import { toast } from 'react-toastify';

const QRCodeGenerator = () => {
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);

      // Pedir ao backend para gerar um token QR
      const response = await api.get('/auth/generate-qr-token');
      
      if (response.data && response.data.qrToken) {
        const token = response.data.qrToken;
        const qrUrl = `${window.location.origin}/qr-login?token=${token}`;
        
        console.log('✓ QR Code gerado com sucesso');
        console.log('URL:', qrUrl);
        
        setQrData(qrUrl);
        setShowQR(true);
        toast.success('QR Code gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar QR Code');
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error(error.response?.data?.message || 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const qrElement = document.getElementById('qr-code');
    if (qrElement) {
      const canvas = qrElement.querySelector('canvas');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'qr-code.png';
      link.click();
      toast.success('QR Code descarregado!');
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gerar QR Code para Login
        </h3>

        {!showQR ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Gere um código QR que outro utilizador pode digitalizar para fazer login
            </p>
            <Button 
              onClick={generateQRCode}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {loading ? 'A gerar...' : 'Gerar QR Code'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <div id="qr-code">
                {qrData && (
                  <QRCode
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                    renderAs="canvas"
                  />
                )}
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Outro utilizador pode digitalizar este código para fazer login</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={downloadQRCode}
                variant="secondary"
                className="flex-1"
              >
                Descarregar QR Code
              </Button>
              <Button
                onClick={() => setShowQR(false)}
                variant="secondary"
                className="flex-1"
              >
                Gerar Novo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QRCodeGenerator;