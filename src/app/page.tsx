'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import './riftbound-playmat.css';

export default function PlaymatGenerator() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('riftbound');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewCanvases, setPreviewCanvases] = useState<{ [key: string]: string }>({});

  const gameOptions = [
    { id: 'riftbound', name: 'Riftbound', description: 'League of Legends Trading Card Game' },
    { id: 'magic', name: 'Magic: The Gathering', description: 'Trading Card Game' },
    { id: 'onepiece', name: 'One Piece', description: 'Trading Card Game' },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        console.log('Image data loaded, length:', imageData.length);
        setBackgroundImage(imageData);
        // Automatically generate playmat when image is uploaded
        console.log('Selected game:', selectedGame);
        generatePlaymatWithImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawRiftboundZones = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'transparent';

    // Helper function to draw hexagon
    const drawHexagon = (x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
    };

    // Left column of hexagons (10 hexagons)
    const hexSize = 25;
    const hexSpacing = 60;
    const leftMargin = 50;
    const topMargin = 80;
    
    for (let i = 0; i < 10; i++) {
      const hexY = topMargin + (i * hexSpacing);
      drawHexagon(leftMargin, hexY, hexSize);
    }

    // Main play area
    const centerStartX = leftMargin + hexSize * 2 + 30;
    const centerWidth = width - centerStartX - 50;
    const sectionHeight = 60;
    const verticalZoneWidth = 50;
    const verticalZoneHeight = 100;

    // Top section - 2 open zones
    const topY = 60;
    const zoneSpacing = 80;
    
    // First open zone
    ctx.beginPath();
    ctx.moveTo(centerStartX, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing, topY + sectionHeight);
    ctx.moveTo(centerStartX, topY + sectionHeight);
    ctx.lineTo(centerStartX, topY);
    ctx.moveTo(centerStartX + zoneSpacing, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing, topY);
    ctx.stroke();

    // Second open zone
    ctx.beginPath();
    ctx.moveTo(centerStartX + zoneSpacing + 20, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing + 20 + zoneSpacing, topY + sectionHeight);
    ctx.moveTo(centerStartX + zoneSpacing + 20, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing + 20, topY);
    ctx.moveTo(centerStartX + zoneSpacing + 20 + zoneSpacing, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing + 20 + zoneSpacing, topY);
    ctx.stroke();

    // Middle section - 3 rectangles
    const middleY = topY + sectionHeight + 20;
    
    // Left vertical rectangle
    ctx.beginPath();
    ctx.rect(centerStartX, middleY, verticalZoneWidth, verticalZoneHeight);
    ctx.stroke();

    // Center horizontal rectangle
    ctx.beginPath();
    ctx.rect(centerStartX + verticalZoneWidth + 10, middleY, centerWidth - verticalZoneWidth - 10, sectionHeight);
    ctx.stroke();

    // Right vertical rectangle
    ctx.beginPath();
    ctx.rect(width - 100, middleY, verticalZoneWidth, verticalZoneHeight);
    ctx.stroke();

    // Bottom section - 2 rectangles
    const bottomY = middleY + verticalZoneHeight + 20;
    
    // Left vertical rectangle
    ctx.beginPath();
    ctx.rect(centerStartX, bottomY, verticalZoneWidth, verticalZoneHeight);
    ctx.stroke();

    // Center horizontal rectangle
    ctx.beginPath();
    ctx.rect(centerStartX + verticalZoneWidth + 10, bottomY, centerWidth - verticalZoneWidth - 10, sectionHeight);
    ctx.stroke();
  }, []);

  const drawMagicZones = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'transparent';

    // Library zone (top left)
    ctx.beginPath();
    ctx.rect(50, 50, 80, 120);
    ctx.stroke();

    // Graveyard zone (top right)
    ctx.beginPath();
    ctx.rect(width - 130, 50, 80, 120);
    ctx.stroke();

    // Hand zone (bottom)
    ctx.beginPath();
    ctx.rect(50, height - 170, width - 100, 120);
    ctx.stroke();

    // Battlefield zones (center)
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Lands zone
    ctx.beginPath();
    ctx.rect(centerX - 200, centerY - 100, 150, 80);
    ctx.stroke();
    
    // Creatures zone
    ctx.beginPath();
    ctx.rect(centerX + 50, centerY - 100, 150, 80);
    ctx.stroke();

    // Command zone (top center)
    ctx.beginPath();
    ctx.arc(centerX, 100, 30, 0, 2 * Math.PI);
    ctx.stroke();
  }, []);

  const drawOnePieceZones = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'transparent';

    // Life area (top)
    ctx.beginPath();
    ctx.rect(50, 30, width - 100, 60);
    ctx.stroke();

    // Deck zone (top left)
    ctx.beginPath();
    ctx.rect(80, 120, 100, 140);
    ctx.stroke();

    // Trash zone (top right)
    ctx.beginPath();
    ctx.rect(width - 180, 120, 100, 140);
    ctx.stroke();

    // Stage zone (center)
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Leader zone
    ctx.beginPath();
    ctx.rect(centerX - 100, centerY - 80, 80, 120);
    ctx.stroke();
    
    // Character zones (3 slots)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(centerX + 20 + (i * 90), centerY - 80, 80, 120);
      ctx.stroke();
    }

    // Hand zone (bottom)
    ctx.beginPath();
    ctx.rect(50, height - 150, width - 100, 100);
    ctx.stroke();
  }, []);

  const drawRiftboundPreview = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    // Helper function to draw hexagon
    const drawHexagon = (x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
    };

    // Left column of hexagons (5 hexagons for preview)
    const hexSize = 8;
    const hexSpacing = 20;
    const leftMargin = 15;
    const topMargin = 20;
    
    for (let i = 0; i < 5; i++) {
      const hexY = topMargin + (i * hexSpacing);
      drawHexagon(leftMargin, hexY, hexSize);
    }

    // Section positioning
    const centerStartX = leftMargin + hexSize * 2 + 10;
    const centerWidth = width - centerStartX - 30;
    const sectionHeight = 20;
    const verticalZoneWidth = 15;
    const verticalZoneHeight = 30;

    // Top section - 2 open zones
    const topY = 15;
    const zoneSpacing = 25;
    
    // First open zone
    ctx.beginPath();
    ctx.moveTo(centerStartX, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing, topY + sectionHeight);
    ctx.moveTo(centerStartX, topY + sectionHeight);
    ctx.lineTo(centerStartX, topY);
    ctx.moveTo(centerStartX + zoneSpacing, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing, topY);
    ctx.stroke();

    // Second open zone
    ctx.beginPath();
    ctx.moveTo(centerStartX + zoneSpacing + 10, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing + 10 + zoneSpacing, topY + sectionHeight);
    ctx.moveTo(centerStartX + zoneSpacing + 10, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing + 10, topY);
    ctx.moveTo(centerStartX + zoneSpacing + 10 + zoneSpacing, topY + sectionHeight);
    ctx.lineTo(centerStartX + zoneSpacing + 10 + zoneSpacing, topY);
    ctx.stroke();

    // Middle section - 3 closed rectangles
    const middleY = topY + sectionHeight + 5;
    
    // Left vertical rectangle
    ctx.beginPath();
    ctx.rect(centerStartX, middleY, verticalZoneWidth, verticalZoneHeight);
    ctx.stroke();

    // Center horizontal rectangle
    ctx.beginPath();
    ctx.rect(centerStartX + verticalZoneWidth + 5, middleY, centerWidth - verticalZoneWidth - 5, sectionHeight);
    ctx.stroke();

    // Right vertical rectangle
    ctx.beginPath();
    ctx.rect(width - 30, middleY, verticalZoneWidth, verticalZoneHeight);
    ctx.stroke();

    // Bottom section - 2 closed rectangles
    const bottomY = middleY + verticalZoneHeight + 5;
    
    // Left vertical rectangle
    ctx.beginPath();
    ctx.rect(centerStartX, bottomY, verticalZoneWidth, verticalZoneHeight);
    ctx.stroke();

    // Center horizontal rectangle
    ctx.beginPath();
    ctx.rect(centerStartX + verticalZoneWidth + 5, bottomY, centerWidth - verticalZoneWidth - 5, sectionHeight);
    ctx.stroke();
  }, []);

  const drawMagicPreview = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    
    // Library
    ctx.beginPath();
    ctx.rect(10, 10, 30, 40);
    ctx.stroke();

    // Graveyard
    ctx.beginPath();
    ctx.rect(width - 40, 10, 30, 40);
    ctx.stroke();

    // Hand
    ctx.beginPath();
    ctx.rect(10, height - 30, width - 20, 20);
    ctx.stroke();

    // Battlefield
    ctx.beginPath();
    ctx.rect(50, 30, 40, 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(110, 30, 40, 25);
    ctx.stroke();

    // Command zone
    ctx.beginPath();
    ctx.arc(width / 2, 15, 8, 0, 2 * Math.PI);
    ctx.stroke();
  }, []);

  const drawOnePiecePreview = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 1;
    
    // Life area
    ctx.beginPath();
    ctx.rect(10, 5, width - 20, 15);
    ctx.stroke();

    // Deck
    ctx.beginPath();
    ctx.rect(15, 25, 25, 35);
    ctx.stroke();

    // Trash
    ctx.beginPath();
    ctx.rect(width - 40, 25, 25, 35);
    ctx.stroke();

    // Leader
    ctx.beginPath();
    ctx.rect(50, 30, 20, 30);
    ctx.stroke();

    // Characters
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(75 + (i * 25), 30, 20, 30);
      ctx.stroke();
    }

    // Hand
    ctx.beginPath();
    ctx.rect(10, height - 25, width - 20, 15);
    ctx.stroke();
  }, []);

  const generatePreview = useCallback((gameId: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set smaller canvas size for preview
    canvas.width = 200;
    canvas.height = 120;

    // Clear canvas with light gray background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw playmat zones based on game
    switch (gameId) {
      case 'riftbound':
        drawRiftboundPreview(ctx, canvas.width, canvas.height);
        break;
      case 'magic':
        drawMagicPreview(ctx, canvas.width, canvas.height);
        break;
      case 'onepiece':
        drawOnePiecePreview(ctx, canvas.width, canvas.height);
        break;
    }

    // Convert to data URL and store
    const dataURL = canvas.toDataURL();
    setPreviewCanvases(prev => ({
      ...prev,
      [gameId]: dataURL
    }));
  }, [drawRiftboundPreview, drawMagicPreview, drawOnePiecePreview]);

  // Generate previews when component mounts
  useEffect(() => {
    gameOptions.forEach(game => {
      generatePreview(game.id);
    });
  }, []); // Remove dependencies to prevent infinite loop

  const generatePlaymatWithImage = useCallback(async (imageData: string) => {
    console.log('Generating playmat with image...');
    
    // For all games, use Canvas
    if (!canvasRef.current) {
      console.log('Canvas ref not found');
      return;
    }

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Could not get canvas context');
      setIsGenerating(false);
      return;
    }

    // Set canvas size (standard playmat size)
    canvas.width = 1200;
    canvas.height = 800;

    // Load and draw background image
    const img = new window.Image();
    img.onload = () => {
      console.log('Image loaded, drawing to canvas...');
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image to fill canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw playmat zones on top based on selected game
      switch (selectedGame) {
        case 'magic':
          drawMagicZones(ctx, canvas.width, canvas.height);
          break;
        case 'onepiece':
          drawOnePieceZones(ctx, canvas.width, canvas.height);
          break;
        case 'riftbound':
          drawRiftboundZones(ctx, canvas.width, canvas.height);
          break;
        default:
          drawMagicZones(ctx, canvas.width, canvas.height);
      }
      
      console.log('Playmat generated successfully');
      setIsGenerating(false);
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      setIsGenerating(false);
    };
    
    img.src = imageData;
  }, [drawMagicZones, drawOnePieceZones, drawRiftboundZones, selectedGame]);

  const generatePlaymat = useCallback(async () => {
    if (!backgroundImage) return;
    await generatePlaymatWithImage(backgroundImage);
  }, [backgroundImage, generatePlaymatWithImage]);



  const downloadPlaymat = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'custom-playmat.png';
    link.href = canvas.toDataURL();
    link.click();
  }, [selectedGame]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Generador de Playmat Personalizado
          </h1>
          <p className="text-lg text-gray-600">
            Sube una imagen y genera tu playmat personalizado con zonas de cartas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Configurar Playmat</h2>
            
            {/* Game Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Seleccionar Juego</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {gameOptions.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game.id);
                      // Regenerate playmat if image is already loaded
                      if (backgroundImage) {
                        setTimeout(() => {
                          generatePlaymatWithImage(backgroundImage);
                        }, 100);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedGame === game.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium mb-2">{game.name}</div>
                    {previewCanvases[game.id] && (
                      <div className="w-full h-20 flex items-center justify-center">
                        <NextImage
                          src={previewCanvases[game.id]}
                          alt={`${game.name} preview`}
                          width={200}
                          height={120}
                          className="object-contain border border-gray-200 rounded"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">Subir Imagen de Fondo</h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-gray-500 mb-2">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Seleccionar imagen
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </label>
              </div>

              {backgroundImage && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Imagen seleccionada:</h3>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <NextImage
                      src={backgroundImage}
                      alt="Background preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={generatePlaymat}
                disabled={!backgroundImage || isGenerating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generando...' : 'Regenerar Playmat'}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Vista Previa</h2>
            
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              {isGenerating && (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Generando playmat...</p>
                  </div>
                </div>
              )}
              {!isGenerating && (
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-96 object-contain mx-auto"
                  style={{ maxWidth: '100%' }}
                />
              )}
            </div>

            <button
              onClick={downloadPlaymat}
              disabled={!backgroundImage}
              className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Descargar Playmat
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Instrucciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Cómo usar:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Sube una imagen que quieras usar como fondo</li>
                <li>Haz clic en "Generar Playmat"</li>
                <li>Revisa la vista previa</li>
                <li>Descarga tu playmat personalizado</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Zonas del playmat:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Zonas de cartas en los laterales</li>
                <li>Zonas especiales en las esquinas</li>
                <li>Líneas divisorias del área de juego</li>
                <li>Marcadores de esquina</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
