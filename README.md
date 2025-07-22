# Generador de Playmat Personalizado

Una aplicación web para crear playmats personalizados para juegos de cartas. Los usuarios pueden subir una imagen de fondo y la aplicación superpone automáticamente las zonas de cartas y elementos del juego.

## Características

- 🖼️ **Subida de imágenes**: Soporte para PNG, JPG, GIF
- 🎮 **Zonas de cartas**: Brackets en forma de "L" para posicionar cartas
- 📐 **Zonas especiales**: Áreas para mazos, descartes y elementos especiales
- 🎨 **Diseño personalizable**: Fondo completamente personalizable
- 💾 **Descarga directa**: Exporta tu playmat como imagen PNG
- 📱 **Responsive**: Funciona en desktop y móvil

## Tecnologías

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **Canvas API** - Generación de imágenes
- **File API** - Manejo de archivos

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd playmat
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta en desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. **Sube una imagen**: Haz clic en "Seleccionar imagen" y elige tu imagen de fondo
2. **Genera el playmat**: Haz clic en "Generar Playmat" para crear la vista previa
3. **Descarga**: Haz clic en "Descargar Playmat" para guardar tu creación

## Zonas del Playmat

- **Línea superior**: Área para mazos y descartes
- **Zonas laterales**: Espacios para cartas en juego
- **Área central**: Zona principal de juego
- **Esquinas inferiores**: Zonas especiales con formas de diamante
- **Zonas centrales inferiores**: Espacios para cartas adicionales
- **Marcadores de esquina**: Indicadores de límites del playmat

## Deploy en Hostinger

### Opción 1: Deploy Estático (Recomendado)

1. Construye la aplicación:
```bash
npm run build
```

2. Sube el contenido de la carpeta `out/` a tu hosting de Hostinger

3. Configura tu dominio para apuntar a estos archivos

### Opción 2: Deploy con Node.js

1. Sube todo el código fuente a tu servidor Hostinger

2. Instala las dependencias:
```bash
npm install --production
```

3. Construye la aplicación:
```bash
npm run build
```

4. Inicia el servidor:
```bash
npm start
```

## Estructura del Proyecto

```
playmat/
├── src/
│   └── app/
│       ├── page.tsx          # Página principal
│       ├── layout.tsx        # Layout de la aplicación
│       └── globals.css       # Estilos globales
├── public/                   # Archivos estáticos
├── next.config.ts           # Configuración de Next.js
├── package.json             # Dependencias y scripts
└── README.md               # Este archivo
```

## Personalización

### Cambiar colores de las zonas

Edita la función `drawPlaymatZones` en `src/app/page.tsx`:

```typescript
ctx.strokeStyle = '#ff0000'; // Cambia el color rojo por el que prefieras
```

### Modificar tamaños

Ajusta las variables de tamaño en la función `drawPlaymatZones`:

```typescript
const cardWidth = 60;    // Ancho de las zonas de cartas
const cardHeight = 80;   // Alto de las zonas de cartas
const cardSpacing = 100; // Espaciado entre zonas
```

### Agregar nuevas zonas

Puedes agregar nuevas zonas dibujando en el canvas dentro de la función `drawPlaymatZones`.

## Scripts Disponibles

- `npm run dev` - Ejecuta en modo desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run deploy` - Construye para deploy

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas, abre un issue en el repositorio o contacta al desarrollador.
