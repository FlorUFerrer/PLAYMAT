'use client';

import React, { useState, useRef, useCallback } from 'react';
import NextImage from 'next/image';

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'hexagon' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  strokeWidth: number;
}

export default function PlaymatEditor() {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<string>('#FF0000');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensiones del playmat para impresión (13.8" x 23.6" a 300 DPI)
  const PLAYMAT_WIDTH = 7080; // 23.6" * 300 DPI
  const PLAYMAT_HEIGHT = 4140; // 13.8" * 300 DPI
  const DISPLAY_WIDTH = 800; // Tamaño visual fijo
  const DISPLAY_HEIGHT = 467; // Tamaño visual fijo

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        console.log('Image uploaded, URL length:', imageData.length);
        setBackgroundImage(imageData);
        // Keep shapes when changing image - they will stay in their positions
      };
      reader.readAsDataURL(file);
    }
  };

  const addShape = (type: Shape['type']) => {
    const newShape: Shape = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'rectangle' ? 50 : 80,
      height: type === 'rectangle' ? 75 : 80,
      color: lastUsedColor,
      rotation: type === 'rectangle' ? 180 : 0,
      strokeWidth: 3
    };
    setShapes([...shapes, newShape]);
    setSelectedShape(newShape.id);
  };

  const updateShape = (id: string, updates: Partial<Shape>) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, ...updates } : shape
    ));
    
    // Update last used color when color is changed
    if (updates.color) {
      setLastUsedColor(updates.color);
    }
  };

  const deleteShape = (id: string) => {
    setShapes(shapes.filter(shape => shape.id !== id));
    if (selectedShape === id) {
      setSelectedShape(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, shapeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - shape.x,
      y: e.clientY - rect.top - shape.y
    });
    setIsDragging(true);
    setSelectedShape(shapeId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedShape || !containerRef.current) return;

    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y));

    updateShape(selectedShape, { x, y });
  }, [isDragging, selectedShape, dragOffset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    
    // Scale from display size to download size
    const DOWNLOAD_WIDTH = 2400;
    const DOWNLOAD_HEIGHT = 1400;
    const scaleX = DOWNLOAD_WIDTH / 800;
    const scaleY = DOWNLOAD_HEIGHT / 467;
    
    // Scale shape properties
    const scaledX = shape.x * scaleX;
    const scaledY = shape.y * scaleY;
    const scaledWidth = shape.width * scaleX;
    const scaledHeight = shape.height * scaleY;
    const scaledStrokeWidth = shape.strokeWidth * Math.min(scaleX, scaleY);
    
    ctx.translate(scaledX + scaledWidth / 2, scaledY + scaledHeight / 2);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = scaledStrokeWidth;
    ctx.fillStyle = 'transparent';

    switch (shape.type) {
      case 'rectangle':
        ctx.strokeRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, scaledWidth / 2, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = (scaledWidth / 2) * Math.cos(angle);
          const y = (scaledHeight / 2) * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -scaledHeight / 2);
        ctx.lineTo(-scaledWidth / 2, scaledHeight / 2);
        ctx.lineTo(scaledWidth / 2, scaledHeight / 2);
        ctx.closePath();
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  const generatePlaymat = useCallback(() => {
    if (!canvasRef.current || !backgroundImage) {
      console.log('Canvas ref or background image missing');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Could not get canvas context');
      return;
    }

    console.log('Generating playmat...');
    console.log('Canvas size:', PLAYMAT_WIDTH, 'x', PLAYMAT_HEIGHT);
    console.log('Shapes count:', shapes.length);

    // Set canvas size for download (reduced for better compatibility)
    const DOWNLOAD_WIDTH = 2400; // 8" at 300 DPI
    const DOWNLOAD_HEIGHT = 1400; // 4.67" at 300 DPI
    canvas.width = DOWNLOAD_WIDTH;
    canvas.height = DOWNLOAD_HEIGHT;

    // Load and draw background image
    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // Permitir CORS
    img.onload = () => {
      console.log('Background image loaded, size:', img.width, 'x', img.height);
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image with proper scaling
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      console.log('Background drawn, drawing shapes...');
      // Draw all shapes
      shapes.forEach(shape => drawShape(ctx, shape));
      console.log('Playmat generated successfully');
    };
    img.onerror = (error) => {
      console.error('Error loading background image:', error);
      // Fallback: draw a gray background
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw shapes anyway
      shapes.forEach(shape => drawShape(ctx, shape));
    };
    img.src = backgroundImage;
  }, [backgroundImage, shapes]);

  const downloadPlaymat = () => {
    if (!canvasRef.current || !backgroundImage) {
      console.log('Canvas ref or background image missing');
      alert('Por favor, sube una imagen de fondo primero.');
      return;
    }
    
    try {
      console.log('Generating and downloading playmat...');
      
      // Generate the playmat first
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.log('Could not get canvas context');
        return;
      }

      // Set canvas size for download (reduced for better compatibility)
      const DOWNLOAD_WIDTH = 2400; // 8" at 300 DPI
      const DOWNLOAD_HEIGHT = 1400; // 4.67" at 300 DPI
      canvas.width = DOWNLOAD_WIDTH;
      canvas.height = DOWNLOAD_HEIGHT;

      // Load and draw background image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('Background image loaded, drawing...');
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw all shapes
        shapes.forEach(shape => drawShape(ctx, shape));
        
        // Download the generated playmat
        console.log('Playmat generated, starting download...');
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'playmat-personalizado.png';
        link.href = dataURL;
        link.click();
        console.log('Download completed');
      };
      img.onerror = (error) => {
        console.error('Error loading background image:', error);
        alert('Error al cargar la imagen de fondo. Por favor, intenta de nuevo.');
      };
      img.src = backgroundImage;
      
    } catch (error) {
      console.error('Error during generation/download:', error);
      alert('Error al generar y descargar el playmat. Por favor, intenta de nuevo.');
    }
  };

  const selectedShapeData = shapes.find(s => s.id === selectedShape);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          Editor de Playmat Personalizable
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Dimensiones para impresión: 23.6" × 13.8" (7080 × 4140 píxeles a 300 DPI)
        </p>

                 <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
           {/* Left Panel - Controls */}
           <div className="lg:col-span-2 space-y-6 order-2 lg:order-1 bg-gray-800 p-8 rounded-lg">
                         {/* Image Upload */}
             <div className="bg-gray-700 rounded-lg shadow-lg p-8">
               <h2 className="text-xl font-semibold mb-4 text-white">Subir imagen de Fondo</h2>
               {shapes.length > 0 && (
                 <div className="mb-3 p-2 bg-blue-900 border border-blue-600 rounded text-sm text-blue-200">
                   💡 Las formas se mantendrán en su posición al cambiar la imagen
                 </div>
               )}
              <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <label className="text-blue-400 cursor-pointer hover:text-blue-300">
                  Seleccionar imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-400 mt-2">PNG, JPG, GIF hasta 10MB</p>
              </div>
              
              {backgroundImage && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-white">Imagen seleccionada:</h3>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <NextImage
                      src={backgroundImage}
                      alt="Background preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

                         {/* Shape Tools */}
             <div className="bg-gray-700 rounded-lg shadow-lg p-8">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-white">Formas</h2>
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-300 bg-gray-600 px-2 py-1 rounded">
                     {shapes.length} formas
                   </span>
                   <div className="flex items-center gap-1">
                     <span className="text-xs text-gray-300">Color:</span>
                     <div 
                       className="w-4 h-4 rounded border border-gray-500"
                       style={{ backgroundColor: lastUsedColor }}
                       title={`Color actual: ${lastUsedColor}`}
                     />
                   </div>
                 </div>
               </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addShape('rectangle')}
                  className="p-6 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600"
                >
                  <div className="w-8 h-10 border-2 border-gray-300 mx-auto mb-2"></div>
                  <span className="text-sm text-white">Rectángulo</span>
                </button>
                <button
                  onClick={() => addShape('circle')}
                  className="p-6 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600"
                >
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-white">Círculo</span>
                </button>
                <button
                  onClick={() => addShape('hexagon')}
                  className="p-6 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="#9CA3AF"/>
                  </svg>
                  <span className="text-sm text-white">Hexágono</span>
                </button>
                <button
                  onClick={() => addShape('triangle')}
                  className="p-6 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600"
                >
                  <div className="w-8 h-8 border-2 border-gray-300 mx-auto mb-2" style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  }}></div>
                  <span className="text-sm text-white">Triángulo</span>
                </button>
              </div>
            </div>

            

            
          </div>

                     {/* Main Canvas Area */}
           <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                              <h2 className="text-xl font-semibold mb-4 text-white">Editor de Playmat</h2>
              
                             <div className="flex justify-center">
                               <div 
                 ref={containerRef}
                 className={`relative border-2 border-gray-500 rounded-lg overflow-hidden bg-gray-700 ${
                   isDragging ? 'cursor-grabbing' : selectedShape ? 'cursor-pointer' : 'cursor-default'
                 }`}
                 style={{ 
                   width: `${DISPLAY_WIDTH}px`,
                   height: `${DISPLAY_HEIGHT}px`,
                   maxWidth: '100%',
                   maxHeight: '85vh'
                 }}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseLeave}
                 onClick={() => setSelectedShape(null)}
               >
                {backgroundImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={backgroundImage}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                                                  {shapes.map((shape) => (
                   <div
                     key={shape.id}
                     className={`absolute cursor-move ${
                       selectedShape === shape.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                     }`}
                     style={{
                       left: shape.x,
                       top: shape.y,
                       width: shape.width,
                       height: shape.height,
                       transform: `rotate(${shape.rotation}deg)`,
                       pointerEvents: 'auto',
                     }}
                     onMouseDown={(e) => handleMouseDown(e, shape.id)}
                     onClick={(e) => {
                       e.stopPropagation();
                       setSelectedShape(shape.id);
                     }}
                   >
                     {shape.type === 'rectangle' && (
                       <div
                         className="w-full h-full bg-transparent"
                         style={{ 
                           borderColor: shape.color,
                           borderStyle: 'solid',
                           borderWidth: `${shape.strokeWidth}px`
                         }}
                       />
                     )}
                     {shape.type === 'circle' && (
                       <div
                         className="w-full h-full rounded-full bg-transparent"
                         style={{ 
                           borderColor: shape.color,
                           borderStyle: 'solid',
                           borderWidth: `${shape.strokeWidth}px`
                         }}
                       />
                     )}
                     {shape.type === 'hexagon' && (
                       <div
                         className="w-full h-full bg-transparent"
                         style={{ 
                           borderColor: shape.color,
                           borderStyle: 'solid',
                           borderWidth: `${shape.strokeWidth}px`,
                           clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                         }}
                       />
                     )}
                     {shape.type === 'triangle' && (
                       <div
                         className="w-full h-full bg-transparent"
                         style={{ 
                           borderColor: shape.color,
                           borderStyle: 'solid',
                           borderWidth: `${shape.strokeWidth}px`,
                           clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                         }}
                       />
                     )}
                     
                     {/* Delete button for each shape - only show when selected */}
                     {selectedShape === shape.id && (
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteShape(shape.id);
                         }}
                         className="absolute -top-3 -right-3 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700 transition-colors z-20 shadow-lg"
                         title="Eliminar forma"
                         style={{ pointerEvents: 'auto' }}
                       >
                         ×
                       </button>
                     )}
                   </div>
                 ))}
                
                                 {!backgroundImage && (
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                     <div className="text-center">
                       <div className="text-6xl mb-4">🖼️</div>
                       <p className="text-lg">Sube una imagen para empezar</p>
                     </div>
                   </div>
                 )}
                 
                 {selectedShape && (
                   <div className="absolute top-4 left-4 bg-blue-900 border border-blue-600 rounded-lg px-3 py-2 text-sm text-blue-200">
                     💡 Haz clic en la imagen para deseleccionar la forma
                   </div>
                 )}
              </div>
                             </div>

                             {/* Hidden Canvas for Download */}
               <canvas ref={canvasRef} className="hidden" />
             </div>

             {/* Shape Properties Panel */}
             {selectedShapeData && (
               <div className="mt-4 bg-gray-700 rounded-lg shadow-lg p-4">
                 <h3 className="text-lg font-semibold mb-3 text-white">Propiedades de la Forma Seleccionada</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Color</label>
                     <input
                       type="color"
                       value={selectedShapeData.color}
                       onChange={(e) => updateShape(selectedShapeData.id, { color: e.target.value })}
                       className="w-full h-10 border border-gray-500 rounded"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Ancho</label>
                     <div className="space-y-2">
                       <input
                         type="range"
                         min="20"
                         max="650"
                         value={selectedShapeData.width}
                         onChange={(e) => updateShape(selectedShapeData.id, { width: parseInt(e.target.value) })}
                         className="w-full"
                       />
                       <div className="flex gap-2 items-center justify-center">
                         <input
                           type="number"
                           min="20"
                           max="650"
                           value={selectedShapeData.width}
                           onChange={(e) => updateShape(selectedShapeData.id, { width: parseInt(e.target.value) || 20 })}
                           className="w-16 h-8 px-2 border border-gray-500 rounded text-sm bg-gray-600 text-white"
                         />
                         <span className="text-sm text-gray-300">px</span>
                       </div>
                     </div>

                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Alto</label>
                     <div className="space-y-2">
                       <input
                         type="range"
                         min="20"
                         max="400"
                         value={selectedShapeData.height}
                         onChange={(e) => updateShape(selectedShapeData.id, { height: parseInt(e.target.value) })}
                         className="w-full"
                       />
                       <div className="flex gap-2 items-center justify-center">
                         <input
                           type="number"
                           min="20"
                           max="400"
                           value={selectedShapeData.height}
                           onChange={(e) => updateShape(selectedShapeData.id, { height: parseInt(e.target.value) || 20 })}
                           className="w-16 h-8 px-2 border border-gray-500 rounded text-sm bg-gray-600 text-white"
                         />
                         <span className="text-sm text-gray-300">px</span>
                       </div>
                     </div>

                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Rotación</label>
                     <div className="space-y-2">
                       <input
                         type="range"
                         min="0"
                         max="360"
                         value={selectedShapeData.rotation}
                         onChange={(e) => updateShape(selectedShapeData.id, { rotation: parseInt(e.target.value) })}
                         className="w-full"
                       />
                       <div className="flex gap-2 items-center justify-center">
                         <input
                           type="number"
                           min="0"
                           max="360"
                           value={selectedShapeData.rotation}
                           onChange={(e) => updateShape(selectedShapeData.id, { rotation: parseInt(e.target.value) || 0 })}
                           className="w-16 h-8 px-2 border border-gray-500 rounded text-sm bg-gray-600 text-white"
                         />
                         <span className="text-sm text-gray-300">°</span>
                       </div>
                     </div>

                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Grosor</label>
                     <div className="space-y-2">
                       <input
                         type="range"
                         min="1"
                         max="25"
                         value={selectedShapeData.strokeWidth}
                         onChange={(e) => updateShape(selectedShapeData.id, { strokeWidth: parseInt(e.target.value) })}
                         className="w-full"
                       />
                       <div className="flex gap-2 items-center justify-center">
                         <input
                           type="number"
                           min="1"
                           max="25"
                           value={selectedShapeData.strokeWidth}
                           onChange={(e) => updateShape(selectedShapeData.id, { strokeWidth: parseInt(e.target.value) || 1 })}
                           className="w-16 h-8 px-2 border border-gray-500 rounded text-sm bg-gray-600 text-white"
                         />
                         <span className="text-sm text-gray-300">px</span>
                       </div>
                     </div>
                   </div>
                   <div>
                     <button
                       onClick={() => deleteShape(selectedShapeData.id)}
                       className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                     >
                       Eliminar Forma
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Actions Panel */}
             <div className="mt-4 bg-gray-700 rounded-lg shadow-lg p-4">
               <h3 className="text-lg font-semibold mb-3 text-white">Acciones</h3>
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 <button
                   onClick={downloadPlaymat}
                   disabled={!backgroundImage}
                   className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   Descargar Playmat
                 </button>
                 <button
                   onClick={() => setShapes([])}
                   disabled={shapes.length === 0}
                   className="bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   Limpiar Formas
                 </button>
                 <button
                   onClick={() => {
                     setShapes([]);
                     setSelectedShape(null);
                   }}
                   disabled={shapes.length === 0}
                   className="bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   Limpiar Todo
                 </button>
               </div>
             </div>
           </div>
         </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Instrucciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">Cómo usar:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Sube una imagen de fondo</li>
                <li>Haz clic en las formas que quieras agregar</li>
                <li>Arrastra las formas para posicionarlas</li>
                <li>Personaliza el color, tamaño y rotación</li>
                <li>Genera y descarga tu playmat</li>
              </ol>
              <div className="mt-3 p-2 bg-blue-900 border border-blue-600 rounded text-sm text-blue-200">
                📏 El playmat se genera en tamaño completo para impresión (23.6" × 13.8")
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Formas disponibles:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Rectángulo - Para zonas de cartas</li>
                <li>Círculo - Para zonas especiales</li>
                <li>Hexágono - Para juegos como Riftbound</li>
                <li>Triángulo - Para marcadores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
