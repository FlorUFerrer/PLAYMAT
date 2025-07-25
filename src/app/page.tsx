'use client';

import React, { useState, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'hexagon' | 'triangle' | 'wideRectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  strokeWidth: number;
}

interface Logo {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  layer: 'behind' | 'front'; // 'behind' = detrás del overlay, 'front' = delante del overlay
  aspectRatio: number; // width/height ratio original del logo
  filters: {
    hue: number;        // 0-360 degrees for hue rotation
    brightness: number; // 0-200 percentage
    contrast: number;   // 0-200 percentage  
    saturate: number;   // 0-200 percentage
    invert: number;     // 0-100 percentage
    sepia?: number;     // 0-100 percentage for uniform color changes (optional)
  };
}

interface OverlayImage {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  filters: {
    hue: number;        // 0-360 degrees for hue rotation
    brightness: number; // 0-200 percentage
    contrast: number;   // 0-200 percentage  
    saturate: number;   // 0-200 percentage
    invert: number;     // 0-100 percentage
    sepia?: number;     // 0-100 percentage for uniform color changes (optional)
  };
}

// Configuración de modelos de Riftbound con variantes de color
const RIFTBOUND_MODELS = {
  'classic': {
    name: 'Clásico',
    description: 'Diseño tradicional de Riftbound',
    imagePath: '/assets/playmat/riftbound/classic.png',
    filters: { hue: 0, brightness: 100, contrast: 100, saturate: 100, invert: 0 }
  },
  'classic-white': {
    name: 'Classic White',
    description: 'Diseño clásico en blanco',
    imagePath: '/assets/playmat/riftbound/classic.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 100 }
  }, 
  'nature-original': {
    name: 'Nature Original',
    description: 'Diseño con elementos naturales',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 0, brightness: 100, contrast: 100, saturate: 100, invert: 0 }
  },
  'nature-dark-green': {
    name: 'Nature Gris',
    description: 'Diseño natural en gris',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 95, brightness: 85, contrast: 115, saturate: 110, invert: 0 }
  },
  'nature-azul': {
    name: 'Nature Azul',
    description: 'Diseño natural en azul vibrante',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 120, brightness: 110, contrast: 125, saturate: 150, invert: 0 }
  },
  'nature-violeta': {
    name: 'Nature Violeta',
    description: 'Diseño natural en violeta vibrante',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 150, brightness: 140, contrast: 140, saturate: 200, invert: 0 }
  },
  'nature-verde': {
    name: 'Nature Verde',
    description: 'Diseño natural en verde',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 0, brightness: 150, contrast: 160, saturate: 250, invert: 0 }
  },
  'nature-rojo': {
    name: 'Nature Rojo',
    description: 'Diseño natural en rojo vibrante',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 270, brightness: 150, contrast: 160, saturate: 250, invert: 0 }
  }, 
  'nature-white': {
    name: 'Nature White',
    description: 'Diseño natural en blanco',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 100 }
  },
  'nature-black': {
    name: 'Nature Black',
    description: 'Diseño natural en negro',
    imagePath: '/assets/playmat/riftbound/nature.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 0 }
  },
  'fancy-white': {
    name: 'Fancy White',
    description: 'Diseño elegante en blanco',
    imagePath: '/assets/playmat/riftbound/fancy.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 100 }
  },
  'fancy-black': {
    name: 'Fancy Black',
    description: 'Diseño elegante en negro',
    imagePath: '/assets/playmat/riftbound/fancy.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 0 }
  },
  'fancy-logo-original': {
    name: 'Fancy con Logo',
    description: 'Diseño elegante con logo original',
    imagePath: '/assets/playmat/riftbound/fancyLogo.png',
    filters: { hue: 0, brightness: 100, contrast: 100, saturate: 100, invert: 0 }
  },
  'fancy-logo-black': {
    name: 'Fancy con Logo Negro',
    description: 'Diseño elegante con logo en negro',
    imagePath: '/assets/playmat/riftbound/fancyLogo.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 0 }
  },
  
  /* Modelos futuros - descomentar cuando estén las imágenes disponibles
  'tournament-original': {
    name: 'Torneo Original',
    description: 'Edición especial para torneos',
    imagePath: '/assets/playmat/riftbound/tournament.png',
    filters: { hue: 0, brightness: 100, contrast: 100, saturate: 100, invert: 0 }
  },
  'tournament-gold': {
    name: 'Torneo Gold',
    description: 'Edición torneo en dorado',
    imagePath: '/assets/playmat/riftbound/tournament.png',
    filters: { hue: 45, brightness: 130, contrast: 110, saturate: 150, invert: 0 }
  }
  */
};

// Configuración de logos disponibles
const AVAILABLE_LOGOS = {
  'lol': {
    name: 'League of Legends',
    description: 'Logo de League of Legends',
    imagePath: '/assets/playmat/logo/logoLol.png',
    filters: { hue: 0, brightness: 100, contrast: 100, saturate: 100, invert: 0 }
  },
  'lol-black': {
    name: 'League of Legends Negro',
    description: 'Logo de League of Legends en negro',
    imagePath: '/assets/playmat/logo/logoLol.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 0 }
  },
  'riftbound': {
    name: 'Riftbound',
    description: 'Logo de Riftbound',
    imagePath: '/assets/playmat/logo/logoRiftBound.png',
    filters: { hue: 0, brightness: 100, contrast: 100, saturate: 100, invert: 0 }
  },
  'riftbound-black': {
    name: 'Riftbound Negro',
    description: 'Logo de Riftbound en negro',
    imagePath: '/assets/playmat/logo/logoRiftBound.png',
    filters: { hue: 0, brightness: 0, contrast: 100, saturate: 100, invert: 0 }
  }
};

// Configuraciones de playmats prearmados
const PREDEFINED_PLAYMATS = {
  riftbound: {
    name: 'Riftbound Playmat',
    description: 'Diseño específico para Riftbound',
    shapes: [] // Sin formas prediseñadas, solo imagen superpuesta
  },
  magic: {
    name: 'Magic: The Gathering Playmat',
    description: 'Diseño estándar para MTG con zonas de biblioteca, cementerio y mano',
    shapes: [
      // Biblioteca
      { type: 'rectangle', x: 50, y: 50, width: 100, height: 140, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      // Cementerio
      { type: 'rectangle', x: 170, y: 50, width: 100, height: 140, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      // Campo de batalla
      { type: 'wideRectangle', x: 300, y: 100, width: 400, height: 200, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      // Mano
      { type: 'wideRectangle', x: 50, y: 350, width: 650, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
    ]
  },
  pokemon: {
    name: 'Pokémon TCG Playmat',
    description: 'Diseño para Pokémon con zonas de Pokémon activo, banco y mano',
    shapes: [
      // Pokémon activo
      { type: 'rectangle', x: 350, y: 150, width: 120, height: 160, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      // Banco (6 espacios)
      { type: 'rectangle', x: 50, y: 50, width: 80, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      { type: 'rectangle', x: 150, y: 50, width: 80, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      { type: 'rectangle', x: 250, y: 50, width: 80, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      { type: 'rectangle', x: 550, y: 50, width: 80, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      { type: 'rectangle', x: 650, y: 50, width: 80, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      { type: 'rectangle', x: 750, y: 50, width: 80, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
      // Mano
      { type: 'wideRectangle', x: 50, y: 350, width: 700, height: 100, color: '#FF0000', rotation: 0, strokeWidth: 3 },
    ]
  }
};

export default function PlaymatEditor() {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [overlayImage, setOverlayImage] = useState<OverlayImage | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [selectedLogoType, setSelectedLogoType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<string>('#FF0000');
  const [showGrid, setShowGrid] = useState(false);
  const [selectedModel, setSelectedModel] = useState<keyof typeof RIFTBOUND_MODELS | null>(null);

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
      width: type === 'rectangle' ? 75 : type === 'wideRectangle' ? 600 : 80,
      height: type === 'rectangle' ? 100 : type === 'wideRectangle' ? 100 : 80,
      color: lastUsedColor,
      rotation: type === 'rectangle' || type === 'wideRectangle' ? 180 : 0,
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

  // Funciones para manejar logos
  const addLogo = (logoKey: keyof typeof AVAILABLE_LOGOS) => {
    const logoConfig = AVAILABLE_LOGOS[logoKey];
    
    // Cargar imagen para obtener dimensiones reales
    const img = new window.Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const baseSize = 120;
      
      const newLogo: Logo = {
        id: Date.now().toString(),
        src: logoConfig.imagePath,
        x: 100,
        y: 100,
        width: baseSize * aspectRatio,
        height: baseSize,
        opacity: 1,
        rotation: 0,
        layer: 'front',
        aspectRatio: aspectRatio,
        filters: logoConfig.filters // Usar los filtros predefinidos del logo
      };
      
      setLogos(prevLogos => [...prevLogos, newLogo]);
      setSelectedLogo(newLogo.id);
      // Deseleccionar formas cuando se selecciona un logo
      setSelectedShape(null);
    };
    
    img.onerror = () => {
      console.error('Error loading logo image:', logoConfig.imagePath);
      // Fallback con aspect ratio 1:1
      const newLogo: Logo = {
        id: Date.now().toString(),
        src: logoConfig.imagePath,
        x: 100,
        y: 100,
        width: 120,
        height: 120,
        opacity: 1,
        rotation: 0,
        layer: 'front',
        aspectRatio: 1,
        filters: logoConfig.filters // Usar los filtros predefinidos del logo
      };
      
      setLogos(prevLogos => [...prevLogos, newLogo]);
      setSelectedLogo(newLogo.id);
      setSelectedShape(null);
    };
    
    img.src = logoConfig.imagePath;
  };

  const updateLogo = (id: string, updates: Partial<Logo>) => {
    setLogos(logos.map(logo => {
      if (logo.id === id) {
        const updatedLogo = { ...logo, ...updates };
        
        // Si se está actualizando la altura (tamaño), mantener la proporción original
        if (updates.height !== undefined) {
          updatedLogo.width = updates.height * logo.aspectRatio;
        }
        
        return updatedLogo;
      }
      return logo;
    }));
  };

  const deleteLogo = (id: string) => {
    setLogos(logos.filter(logo => logo.id !== id));
    if (selectedLogo === id) {
      setSelectedLogo(null);
    }
  };

  const loadPredefinedPlaymat = (playmatKey: keyof typeof PREDEFINED_PLAYMATS) => {
    const playmat = PREDEFINED_PLAYMATS[playmatKey];
    
    // Para Riftbound, cargar imagen superpuesta sin formas prediseñadas
    if (playmatKey === 'riftbound') {
      console.log('Cargando overlay de Riftbound...');
      setOverlayImage({
        src: '/assets/playmat/riftbound.png',
        x: 0,
        y: 0,
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT,
        opacity: 1,
        filters: {
          hue: 0,
          brightness: 100,
          contrast: 100,
          saturate: 100,
          invert: 0
        }
      });
      console.log('Overlay configurado:', {
        src: '/assets/playmat/riftbound.png',
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT
      });
    } else {
      setOverlayImage(null); // No cargar overlay para otros playmats
    }
    
    const newShapes: Shape[] = playmat.shapes.map((shape, index) => ({
      ...shape,
      id: `predefined-${playmatKey}-${Date.now()}-${index}`,
      type: shape.type as Shape['type']
    }));
    
    setShapes(newShapes);
    setSelectedShape(null);
    setShowGrid(true); // Activar cuadrícula automáticamente
  };

  const loadRiftboundModel = (modelKey: keyof typeof RIFTBOUND_MODELS) => {
    const model = RIFTBOUND_MODELS[modelKey];
    
    console.log(`Cargando modelo de Riftbound: ${model.name}...`);
    setSelectedModel(modelKey); // Guardar el modelo seleccionado
    
    // Aplicar márgenes de 5px si usa fancyLogo.png
    const usesFancyLogo = model.imagePath.includes('fancyLogo.png');
    const margin = usesFancyLogo ? 20 : 0;
    
    setOverlayImage({
      src: model.imagePath,
      x: margin,
      y: margin,
      width: DISPLAY_WIDTH - (margin * 2),
      height: DISPLAY_HEIGHT - (margin * 2),
      opacity: 1,
      filters: model.filters // Usar los filtros predefinidos del modelo
    });
    
    // No cargar formas prediseñadas para riftbound, solo la imagen
    setShapes([]);
    setSelectedShape(null);
    setShowGrid(true); // Activar cuadrícula automáticamente
  };

  const updateOverlayFilters = (newFilters: Partial<OverlayImage['filters']>) => {
    if (overlayImage) {
      setOverlayImage({
        ...overlayImage,
        filters: {
          ...overlayImage.filters,
          ...newFilters
        }
      });
    }
  };

  const updateOverlayOpacity = (opacity: number) => {
    if (overlayImage) {
      setOverlayImage({
        ...overlayImage,
        opacity: opacity
      });
    }
  };

  const resetOverlayFilters = () => {
    if (overlayImage && selectedModel) {
      const originalModel = RIFTBOUND_MODELS[selectedModel as keyof typeof RIFTBOUND_MODELS];
      setOverlayImage({
        ...overlayImage,
        opacity: 1, // Reset opacity to 100%
        filters: originalModel.filters // Volver a los filtros originales del modelo seleccionado
      });
    }
  };

  const getCSSFilter = (filters: OverlayImage['filters']) => {
    const sepia = filters.sepia || 0;
    return `sepia(${sepia}%) hue-rotate(${filters.hue}deg) brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) invert(${filters.invert}%)`;
  };

  const getLogoFilter = (filters: Logo['filters']) => {
    const sepia = filters.sepia || 0;
    return `sepia(${sepia}%) hue-rotate(${filters.hue}deg) brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) invert(${filters.invert}%)`;
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
    setSelectedLogo(null);
  };

  const handleLogoMouseDown = (e: React.MouseEvent, logoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const logo = logos.find(l => l.id === logoId);
    if (!logo) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - logo.x,
      y: e.clientY - rect.top - logo.y
    });
    setIsDragging(true);
    setSelectedLogo(logoId);
    setSelectedShape(null);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y));

    if (selectedShape) {
      updateShape(selectedShape, { x, y });
    } else if (selectedLogo) {
      updateLogo(selectedLogo, { x, y });
    }
  }, [isDragging, selectedShape, selectedLogo, dragOffset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Función para manejar teclas presionadas
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedShape) {
      e.preventDefault();
      deleteShape(selectedShape);
    }
  }, [selectedShape, deleteShape]);

  // Agregar y remover event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    
    // Scale from display size to download size
    const scaleX = ctx.canvas.width / DISPLAY_WIDTH;
    const scaleY = ctx.canvas.height / DISPLAY_HEIGHT;
    
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
      case 'wideRectangle':
        ctx.strokeRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(scaledWidth, scaledHeight) / 2, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'hexagon':
        ctx.beginPath();
        const radius = Math.min(scaledWidth, scaledHeight) / 2;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
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
      
      // Draw overlay image if exists
      if (overlayImage) {
        const overlayImg = new window.Image();
        overlayImg.crossOrigin = 'anonymous';
        overlayImg.onload = () => {
          // Scale overlay image to match canvas size
          const scaleX = canvas.width / DISPLAY_WIDTH;
          const scaleY = canvas.height / DISPLAY_HEIGHT;
          const scaledX = overlayImage.x * scaleX;
          const scaledY = overlayImage.y * scaleY;
          const scaledWidth = overlayImage.width * scaleX;
          const scaledHeight = overlayImage.height * scaleY;
          
          // Apply CSS filters using canvas filter
          ctx.filter = getCSSFilter(overlayImage.filters);
          ctx.globalAlpha = overlayImage.opacity;
          ctx.drawImage(overlayImg, scaledX, scaledY, scaledWidth, scaledHeight);
          ctx.filter = 'none'; // Reset filter
          ctx.globalAlpha = 1;
          
          console.log('Background and overlay drawn, drawing shapes...');
          // Draw all shapes
          shapes.forEach(shape => drawShape(ctx, shape));
          console.log('Playmat generated successfully');
        };
        overlayImg.onerror = (error) => {
          console.error('Error loading overlay image:', error);
          // Continue without overlay
          console.log('Background drawn, drawing shapes...');
          shapes.forEach(shape => drawShape(ctx, shape));
          console.log('Playmat generated successfully');
        };
        overlayImg.src = overlayImage.src;
      } else {
        console.log('Background drawn, drawing shapes...');
        // Draw all shapes
        shapes.forEach(shape => drawShape(ctx, shape));
        console.log('Playmat generated successfully');
      }
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

      // Set canvas size for download (high quality for printing)
      const DOWNLOAD_WIDTH = PLAYMAT_WIDTH; // 7080px (23.6" at 300 DPI)
      const DOWNLOAD_HEIGHT = PLAYMAT_HEIGHT; // 4140px (13.8" at 300 DPI)
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
        
        // Draw overlay image if exists
        if (overlayImage) {
          const overlayImg = new window.Image();
          overlayImg.crossOrigin = 'anonymous';
          overlayImg.onload = () => {
            // Scale overlay image to match canvas size
            const scaleX = canvas.width / DISPLAY_WIDTH;
            const scaleY = canvas.height / DISPLAY_HEIGHT;
            const scaledX = overlayImage.x * scaleX;
            const scaledY = overlayImage.y * scaleY;
            const scaledWidth = overlayImage.width * scaleX;
            const scaledHeight = overlayImage.height * scaleY;
            
            // Apply CSS filters using canvas filter
            ctx.filter = getCSSFilter(overlayImage.filters);
            ctx.globalAlpha = overlayImage.opacity;
            ctx.drawImage(overlayImg, scaledX, scaledY, scaledWidth, scaledHeight);
            ctx.filter = 'none'; // Reset filter
            ctx.globalAlpha = 1;
            
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
          overlayImg.onerror = (error) => {
            console.error('Error loading overlay image:', error);
            // Continue without overlay
            shapes.forEach(shape => drawShape(ctx, shape));
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'playmat-personalizado.png';
            link.href = dataURL;
            link.click();
          };
          overlayImg.src = overlayImage.src;
        } else {
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
        }
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
    <div className="min-h-screen bg-gray-900 py-8" style={{ userSelect: 'none', outline: 'none' }}>
      <div className="max-w-[1600px] mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          Editor de Playmat Personalizable
        </h1>
      

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Left Panel - Controls */}
           <div className="lg:col-span-3 space-y-6 order-2 lg:order-1 bg-gray-800 p-8 rounded-lg">
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

                         {/* Logo Tools */}
             <div className="bg-gray-700 rounded-lg shadow-lg p-8">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-white">Logos</h2>
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-300 bg-gray-600 px-2 py-1 rounded">
                     {logos.length} logos
                   </span>
                 </div>
               </div>
               
               <div className="space-y-3">
                 <p className="text-sm text-gray-300">
                   Agrega logos que puedes escalar y posicionar delante o detrás del playmat
                 </p>
                 
                 <div className="space-y-3">
                   <select
                     value={selectedLogoType}
                     onChange={(e) => setSelectedLogoType(e.target.value)}
                     className="w-full p-3 border border-gray-500 rounded-lg bg-gray-600 text-white focus:border-blue-400 focus:outline-none"
                   >
                     <option value="" disabled>Selecciona un logo...</option>
                     {Object.entries(AVAILABLE_LOGOS).map(([key, logo]) => (
                       <option key={key} value={key}>
                         {logo.name} - {logo.description}
                       </option>
                     ))}
                   </select>
                   
                   <button
                     onClick={() => {
                       if (selectedLogoType) {
                         addLogo(selectedLogoType as keyof typeof AVAILABLE_LOGOS);
                         setSelectedLogoType('');
                       }
                     }}
                     disabled={!selectedLogoType}
                     className="w-full p-3 border-2 border-blue-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-blue-600 text-white font-medium flex items-center justify-center gap-3 disabled:bg-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed"
                   >
                     <span className="text-xl">➕</span>
                     Agregar Logo Seleccionado
                   </button>
                 </div>
                 
                 {logos.length > 0 && (
                   <div className="mt-3 p-2 bg-blue-900 border border-blue-600 rounded text-sm text-blue-200">
                     💡 Selecciona un logo para escalarlo y ajustar su posición
                   </div>
                 )}
               </div>
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
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => addShape('rectangle')}
                  className="p-8 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <div className="w-8 h-10 border-2 border-gray-300 mb-3"></div>
                  <span className="text-sm text-white text-center leading-tight">Carta</span>
                </button>
                <button
                  onClick={() => addShape('circle')}
                  className="p-8 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full mb-3"></div>
                  <span className="text-sm text-white text-center leading-tight">Círculo</span>
                </button>
                <button
                  onClick={() => addShape('hexagon')}
                  className="p-8 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="#9CA3AF"/>
                  </svg>
                  <span className="text-sm text-white text-center leading-tight">Hexágono</span>
                </button>
                <button
                  onClick={() => addShape('triangle')}
                  className="p-8 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <ChangeHistoryIcon className="w-8 h-8 mb-3 text-gray-300" />
                  <span className="text-sm text-white text-center leading-tight">Triángulo</span>
                </button>
                <button
                  onClick={() => addShape('wideRectangle')}
                  className="p-8 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <div className="w-12 h-6 border-2 border-gray-300 mb-3"></div>
                  <span className="text-sm text-white text-center leading-tight">Rectángulo</span>
                </button>
              </div>
            </div>

            

            
          </div>

                     {/* Main Canvas Area */}
           <div className="lg:col-span-7 order-1 lg:order-2">
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">Editor de Playmat</h2>
                                <div className="flex items-center gap-3">
                                  {showGrid && (
                                    <div className="bg-blue-900 border border-blue-600 rounded-lg px-3 py-2 text-sm text-blue-200">
                                      💡 La cuadrícula solo es visual y no aparecerá en la descarga
                                    </div>
                                  )}
                                  <button
                                    onClick={() => setShowGrid(!showGrid)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                      showGrid 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                                  >
                                    {showGrid ? 'Ocultar Cuadrícula' : 'Mostrar Cuadrícula'}
                                  </button>
                                </div>
                              </div>
              
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
                 {/* Cuadrícula punteada - solo visible en previsualización */}
                 {showGrid && (
                   <div 
                     className="absolute inset-0 pointer-events-none z-10"
                     style={{
                       backgroundImage: `
                         linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
                       `,
                       backgroundSize: '20px 20px',
                       backgroundPosition: '0 0'
                     }}
                   />
                 )}
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
                
                {/* Render logos behind overlay */}
                {logos.filter(logo => logo.layer === 'behind').map((logo) => (
                  <div
                    key={logo.id}
                    className={`absolute cursor-move ${
                      selectedLogo === logo.id ? 'ring-2 ring-green-500 ring-offset-2' : ''
                    }`}
                    style={{
                      left: logo.x,
                      top: logo.y,
                      width: logo.width,
                      height: logo.height,
                      transform: `rotate(${logo.rotation}deg)`,
                      opacity: logo.opacity,
                      pointerEvents: 'auto',
                      zIndex: 1,
                    }}
                    onMouseDown={(e) => handleLogoMouseDown(e, logo.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLogo(logo.id);
                      setSelectedShape(null);
                    }}
                  >
                    <img
                      src={logo.src}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      style={{ filter: getLogoFilter(logo.filters) }}
                      draggable={false}
                    />
                    
                    {/* Control buttons for each logo - only show when selected */}
                    {selectedLogo === logo.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLogo(logo.id);
                          }}
                          className="absolute -top-3 -right-3 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700 transition-colors z-20 shadow-lg"
                          title="Eliminar logo"
                          style={{ pointerEvents: 'auto' }}
                        >
                          ×
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLogo: Logo = {
                              ...logo,
                              id: Date.now().toString(),
                              x: logo.x + 20,
                              y: logo.y + 20
                            };
                            setLogos([...logos, newLogo]);
                            setSelectedLogo(newLogo.id);
                            setSelectedShape(null);
                          }}
                          className="absolute -top-3 -left-3 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-colors z-20 shadow-lg"
                          title="Duplicar logo"
                          style={{ pointerEvents: 'auto' }}
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {overlayImage && (
                  <div 
                    className={`absolute pointer-events-none ${overlayImage.x > 0 ? 'inset-0 flex items-center justify-center' : 'inset-0'}`} 
                    style={{ zIndex: 2 }}
                  >
                    <img
                      src={overlayImage.src}
                      alt="Overlay"
                      onLoad={() => console.log('Overlay image loaded successfully')}
                      onError={(e) => console.error('Error loading overlay image:', e)}
                      style={{
                        position: overlayImage.x > 0 ? 'relative' : 'absolute',
                        left: overlayImage.x > 0 ? 'auto' : overlayImage.x,
                        top: overlayImage.x > 0 ? 'auto' : overlayImage.y,
                        width: overlayImage.width,
                        height: overlayImage.height,
                        opacity: overlayImage.opacity,
                        filter: getCSSFilter(overlayImage.filters),
                        pointerEvents: 'none',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}
                
                {/* Render logos in front of overlay */}
                {logos.filter(logo => logo.layer === 'front').map((logo) => (
                  <div
                    key={logo.id}
                    className={`absolute cursor-move ${
                      selectedLogo === logo.id ? 'ring-2 ring-green-500 ring-offset-2' : ''
                    }`}
                    style={{
                      left: logo.x,
                      top: logo.y,
                      width: logo.width,
                      height: logo.height,
                      transform: `rotate(${logo.rotation}deg)`,
                      opacity: logo.opacity,
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                    onMouseDown={(e) => handleLogoMouseDown(e, logo.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLogo(logo.id);
                      setSelectedShape(null);
                    }}
                  >
                    <img
                      src={logo.src}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      style={{ filter: getLogoFilter(logo.filters) }}
                      draggable={false}
                    />
                    
                    {/* Control buttons for each logo - only show when selected */}
                    {selectedLogo === logo.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLogo(logo.id);
                          }}
                          className="absolute -top-3 -right-3 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700 transition-colors z-20 shadow-lg"
                          title="Eliminar logo"
                          style={{ pointerEvents: 'auto' }}
                        >
                          ×
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLogo: Logo = {
                              ...logo,
                              id: Date.now().toString(),
                              x: logo.x + 20,
                              y: logo.y + 20
                            };
                            setLogos([...logos, newLogo]);
                            setSelectedLogo(newLogo.id);
                            setSelectedShape(null);
                          }}
                          className="absolute -top-3 -left-3 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-colors z-20 shadow-lg"
                          title="Duplicar logo"
                          style={{ pointerEvents: 'auto' }}
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                ))}

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
                     {(shape.type === 'rectangle' || shape.type === 'wideRectangle') && (
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
                       <svg
                         width="100%"
                         height="100%"
                         viewBox="0 0 100 100"
                         style={{ position: 'absolute', top: 0, left: 0 }}
                       >
                         <polygon
                           points="50,10 90,25 90,75 50,90 10,75 10,25"
                           fill="transparent"
                           stroke={shape.color}
                           strokeWidth={shape.strokeWidth}
                         />
                       </svg>
                     )}
                     {shape.type === 'triangle' && (
                       <svg
                         width="100%"
                         height="100%"
                         viewBox="0 0 100 100"
                         style={{ position: 'absolute', top: 0, left: 0 }}
                       >
                         <polygon
                           points="50,10 10,90 90,90"
                           fill="transparent"
                           stroke={shape.color}
                           strokeWidth={shape.strokeWidth}
                         />
                       </svg>
                     )}
                     
                     {/* Control buttons for each shape - only show when selected */}
                     {selectedShape === shape.id && (
                       <>
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
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             const newShape: Shape = {
                               ...shape,
                               id: Date.now().toString(),
                               x: shape.x + 20,
                               y: shape.y + 20
                             };
                             setShapes([...shapes, newShape]);
                             setSelectedShape(newShape.id);
                           }}
                           className="absolute -top-3 -left-3 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-colors z-20 shadow-lg"
                           title="Duplicar forma"
                           style={{ pointerEvents: 'auto' }}
                         >
                           +
                         </button>
                       </>
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
                           onKeyDown={(e) => e.stopPropagation()}
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
                           onKeyDown={(e) => e.stopPropagation()}
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
                           onKeyDown={(e) => e.stopPropagation()}
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
                           onKeyDown={(e) => e.stopPropagation()}
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

             {/* Logo Properties Panel */}
             {selectedLogo && logos.find(l => l.id === selectedLogo) && (
               <div className="mt-4 bg-gray-700 rounded-lg shadow-lg p-4">
                 <h3 className="text-lg font-semibold mb-3 text-white">Propiedades del Logo Seleccionado</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Tamaño</label>
                     <div className="space-y-2">
                       <input
                         type="range"
                         min="20"
                         max="400"
                         value={logos.find(l => l.id === selectedLogo)?.height || 120}
                         onChange={(e) => updateLogo(selectedLogo, { height: parseInt(e.target.value) })}
                         className="w-full"
                       />
                       <div className="flex gap-2 items-center justify-center">
                         <input
                           type="number"
                           min="20"
                           max="400"
                           value={logos.find(l => l.id === selectedLogo)?.height || 120}
                           onChange={(e) => updateLogo(selectedLogo, { height: parseInt(e.target.value) || 20 })}
                           onKeyDown={(e) => e.stopPropagation()}
                           className="w-16 h-8 px-2 border border-gray-500 rounded text-sm bg-gray-600 text-white"
                         />
                         <span className="text-sm text-gray-300">px</span>
                       </div>
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">Posición</label>
                     <div className="space-y-2">
                       <select
                         value={logos.find(l => l.id === selectedLogo)?.layer || 'front'}
                         onChange={(e) => updateLogo(selectedLogo, { layer: e.target.value as 'behind' | 'front' })}
                         className="w-full p-2 border border-gray-500 rounded bg-gray-600 text-white focus:border-blue-400 focus:outline-none"
                       >
                         <option value="front">Delante</option>
                         <option value="behind">Detrás</option>
                       </select>
                       <div className="text-xs text-gray-300 text-center">
                         {logos.find(l => l.id === selectedLogo)?.layer === 'front' ? 'del playmat' : 'del playmat'}
                       </div>
                     </div>
                   </div>
                   <div>
                     <button
                       onClick={() => deleteLogo(selectedLogo)}
                       className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                     >
                       Eliminar Logo
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Overlay Controls Panel */}
             {overlayImage && (
               <div className="mt-4 bg-gray-700 rounded-lg shadow-lg p-4">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-white">Controles de Imagen</h3>
                   <button
                     onClick={resetOverlayFilters}
                     className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                   >
                     Resetear
                   </button>
                 </div>
                 
                 <div className="space-y-4">
                   {/* Opacity Control */}
                   <div>
                     <label className="block text-sm font-medium mb-2 text-white">
                       Transparencia: {Math.round(overlayImage.opacity * 100)}%
                     </label>
                     <input
                       type="range"
                       min="0"
                       max="1"
                       step="0.01"
                       value={overlayImage.opacity}
                       onChange={(e) => updateOverlayOpacity(parseFloat(e.target.value))}
                       className="w-full"
                     />
                     <div className="flex justify-between text-xs text-gray-300 mt-1">
                       <span>0% (Invisible)</span>
                       <span>50% (Semi-transparente)</span>
                       <span>100% (Opaco)</span>
                     </div>
                   </div>
                 </div>

                 <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded text-sm text-blue-200">
                   💡 <strong>Tip:</strong> Baja la transparencia para crear efectos sutiles o combinar con tu imagen de fondo
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

           {/* Right Panel - Predefined Playmats */}
           <div className="lg:col-span-2 order-3 bg-gray-800 p-4 rounded-lg">
             <div className="bg-gray-700 rounded-lg shadow-lg p-4">
               <h2 className="text-xl font-semibold mb-4 text-white">Playmats Prearmados</h2>
               <p className="text-sm text-gray-300 mb-4">
                 Carga diseños predefinidos y personalízalos según tus necesidades
               </p>
               
               <div className="space-y-2">
                 {/* Riftbound Models with Select */}
                 <div className="border-2 border-gray-500 rounded-lg bg-gray-600 p-3">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="text-2xl">🎮</span>
                                            <div>
                         <h3 className="font-semibold text-white">Riftbound Playmats</h3>                    
                         <p className="text-sm text-gray-300">15 opciones disponibles</p>
                       </div>
                   </div>
                   
                   <select
                     onChange={(e) => {
                       if (e.target.value) {
                         loadRiftboundModel(e.target.value as keyof typeof RIFTBOUND_MODELS);
                         e.target.value = ''; // Reset select after selection
                       }
                     }}
                     className="w-full p-2 border border-gray-400 rounded bg-gray-700 text-white focus:border-blue-400 focus:outline-none"
                     defaultValue=""
                   >
                     <option value="" disabled>Selecciona un modelo...</option>
                     {Object.entries(RIFTBOUND_MODELS).map(([key, model]) => (
                       <option key={key} value={key}>
                         {model.name} - {model.description}
                       </option>
                     ))}
                   </select>
                 </div>
                 
                 <button
                   onClick={() => loadPredefinedPlaymat('magic')}
                   className="w-full p-3 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 text-left"
                 >
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="font-semibold text-white">Magic: The Gathering</h3>
                       <p className="text-sm text-gray-300">Diseño estándar para MTG con zonas de biblioteca, cementerio y mano</p>
                     </div>
                     <div className="text-2xl">🃏</div>
                   </div>
                 </button>
                 
                 <button
                   onClick={() => loadPredefinedPlaymat('pokemon')}
                   className="w-full p-3 border-2 border-gray-500 rounded-lg hover:border-blue-400 hover:bg-blue-900 transition-colors bg-gray-600 text-left"
                 >
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="font-semibold text-white">Pokémon TCG</h3>
                       <p className="text-sm text-gray-300">Diseño para Pokémon con zonas de Pokémon activo, banco y mano</p>
                     </div>
                     <div className="text-2xl">⚡</div>
                   </div>
                 </button>
               </div>
               
               <div className="mt-3 p-2 bg-blue-900 border border-blue-600 rounded text-sm text-blue-200">
                 💡 Al cargar un playmat prearmado, se activará automáticamente la cuadrícula para ayudarte con el posicionamiento
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
                📏 El playmat se genera en tamaño completo para impresión 
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

        {/* Footer */}
        <footer className="mt-12 bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-white">¡Gracias por usar nuestro editor!</h3>
            
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Sugerencias y Contacto */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl mb-2">💌</div>
                  <h4 className="font-semibold text-white mb-2">Sugerencias & Diseños</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    ¿Tienes ideas o quieres agregar nuevos diseños? ¡Contáctanos!
                  </p>
                  <a 
                    href="mailto:infoor3d@gmail.com" 
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    📧 infoor3d@gmail.com
                  </a>
                  <p className="text-xs text-gray-400 mt-2">
                    Aceptamos sugerencias y colaboraciones
                  </p>
                </div>

              {/* Créditos Diseño */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold text-white mb-2">Diseños</h4>
                <p className="text-sm text-gray-300">
                  Diseños de playmats prearmados creados con amor por
                </p>
                <p className="font-medium text-blue-400 mt-1">Facu Godoy</p>
                <p className="text-xs text-gray-400 mt-2">
                  Especialista en diseños únicos para TCG
                </p>
              </div>

              {/* Créditos Desarrollo */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">💻</div>
                <h4 className="font-semibold text-white mb-2">Desarrollo</h4>
                <p className="text-sm text-gray-300">
                  Editor desarrollado con React + Next.js por
                </p>
                <p className="font-medium text-purple-400 mt-1">Florurre</p>
                <p className="text-xs text-gray-400 mt-2">
                  Desarrolladora Full Stack apasionada por los juegos
                </p>
              </div>
            </div>

            {/* Línea inferior */}
            <div className="border-t border-gray-600 pt-4">
              <p className="text-sm text-gray-400">
                Hecho con ❤️ para la comunidad de TCG • 
                <span className="mx-2">🎮</span>
                ¡Crea playmats únicos y personaliza tu experiencia de juego!
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
