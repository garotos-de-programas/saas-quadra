"use client";

import React, { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface PixQRCodeProps {
  pixKey: string;
  pixType: string;
  onClose: () => void;
}

export default function PixQRCode({ pixKey, pixType, onClose }: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);

  // Função para gerar o payload do PIX
  const generatePixPayload = () => {
    // Aqui você pode implementar a geração do payload do PIX
    // Por enquanto, vamos usar a chave diretamente
    return pixKey;
  };

  // Função para copiar a chave PIX
  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Função para baixar o QR Code
  const handleDownloadQRCode = () => {
    const svg = document.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "pix-qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        QR Code PIX
      </h3>
      <div className="space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            value={generatePixPayload()}
            size={200}
            level="H"
            includeMargin={true}
            className="w-48 h-48"
          />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Chave PIX</p>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 font-medium">{pixKey}</p>
            <button
              onClick={handleCopyKey}
              className="text-gray-400 hover:text-[#2563eb]"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Tipo de Chave</p>
          <p className="text-gray-900 font-medium">
            {pixType === "email" && "E-mail"}
            {pixType === "cpf" && "CPF"}
            {pixType === "phone" && "Telefone"}
            {pixType === "random" && "Chave Aleatória"}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleDownloadQRCode}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Download size={20} />
            Baixar QR Code
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
} 