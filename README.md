# Learning Front - Sistema de Gestión Educativa

Aplicación web desarrollada con React, TypeScript y Vite para la gestión de evaluaciones, clases, profesores, estudiantes y rúbricas en un entorno educativo.

## 📋 Descripción

Learning Front es una plataforma educativa que permite:
- Gestión de evaluaciones y exámenes
- Administración de clases y estudiantes
- Gestión de profesores y usuarios
- Creación y gestión de rúbricas
- Generación de códigos QR para evaluaciones
- Integración con Google Sheets
- Visualización de estadísticas y resultados

## 🛠️ Tecnologías Utilizadas

- **React 19** - Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript** - Superset de JavaScript con tipado estático
- **Vite** - Herramienta de construcción rápida para desarrollo frontend
- **Material-UI (MUI)** - Biblioteca de componentes React
- **Tailwind CSS** - Framework de CSS utility-first
- **React Router DOM** - Enrutamiento para aplicaciones React
- **Axios** - Cliente HTTP para realizar peticiones API
- **Zustand** - Librería de manejo de estado ligera
- **React Hook Form** - Librería para manejo de formularios
- **Yup** - Validador de esquemas para JavaScript
- **QRCode React** - Generación de códigos QR
- **XLSX** - Manejo de archivos Excel
- **React Hot Toast** - Notificaciones toast elegantes

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn** como gestor de paquetes
- Un editor de código (recomendado: VS Code)

## 🚀 Instalación

1. **Clona el repositorio** (si aplica) o navega al directorio del proyecto:
```bash
cd Learning_Front
```

2. **Instala las dependencias**:
```bash
npm install
```

Esto instalará todas las dependencias necesarias listadas en `package.json`.

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables (ajusta según tu configuración):

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu-google-client-id
```

### Configuración del Servidor de Desarrollo

El servidor de desarrollo está configurado para ejecutarse en:
- **Host**: `localhost` (configurado para aceptar conexiones externas)
- **Puerto**: `5173`

Puedes modificar estos valores en `vite.config.ts` si es necesario.

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`
Inicia el servidor de desarrollo con Vite. La aplicación estará disponible en `http://localhost:5173` con Hot Module Replacement (HMR) habilitado.

### `npm run build`
Compila la aplicación para producción. Genera los archivos optimizados en la carpeta `dist/`.

### `npm run preview`
Previsualiza la versión de producción localmente después de ejecutar `npm run build`.

### `npm run lint`
Ejecuta ESLint para verificar y corregir problemas de código en el proyecto.

## 📁 Estructura del Proyecto

```
Learning_Front/
├── public/                 # Archivos estáticos públicos
├── src/
│   ├── assets/            # Recursos estáticos (imágenes, iconos)
│   ├── components/         # Componentes reutilizables
│   │   ├── classDetails/   # Componentes de detalles de clase
│   │   ├── home/          # Componentes de la página principal
│   │   ├── rubrics/       # Componentes de rúbricas
│   │   └── settings/      # Componentes de configuración
│   ├── hooks/             # Custom hooks de React
│   ├── lib/               # Utilidades y configuraciones
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios API y lógica de negocio
│   ├── stores/            # Stores de Zustand (estado global)
│   ├── types/             # Definiciones de tipos TypeScript
│   ├── utils/             # Funciones utilitarias
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Punto de entrada de la aplicación
│   └── index.css          # Estilos globales
├── eslint.config.js       # Configuración de ESLint
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración de TypeScript
├── vite.config.ts         # Configuración de Vite
└── README.md              # Este archivo
```

## 🎯 Características Principales

### Páginas Disponibles
- **Login** - Autenticación de usuarios
- **Home** - Dashboard principal (vista de administrador/profesor)
- **Mis Clases** - Gestión de clases por profesor
- **Evaluaciones** - Creación y gestión de evaluaciones
- **Rúbricas** - Gestión de rúbricas de evaluación
- **Configuración** - Administración del sistema
- **Escaneo QR** - Escaneo de códigos QR para evaluaciones

### Funcionalidades
- Autenticación y autorización basada en roles
- CRUD completo para clases, profesores, estudiantes y evaluaciones
- Generación y escaneo de códigos QR
- Importación/exportación de datos mediante Excel
- Integración con Google Sheets
- Visualización de estadísticas y resultados
- Búsqueda y filtrado avanzado

## 🔧 Desarrollo

### Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:5173`.

### Hot Module Replacement (HMR)

Vite incluye HMR por defecto. Los cambios en los archivos se reflejarán automáticamente en el navegador sin necesidad de recargar la página.

### Linting

Para verificar el código antes de hacer commit:

```bash
npm run lint
```

## 🏗️ Build para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`, listos para ser desplegados en cualquier servidor web estático o servicio de hosting.

Para previsualizar la build de producción:

```bash
npm run preview
```

## 📝 Notas Adicionales

- El proyecto utiliza **SWC** para una compilación más rápida
- **Tailwind CSS** está configurado mediante el plugin de Vite
- La aplicación está optimizada para desarrollo rápido con TypeScript
- Se recomienda usar ESLint durante el desarrollo para mantener la calidad del código

## 🤝 Contribución

Si deseas contribuir al proyecto:
1. Asegúrate de seguir las convenciones de código establecidas
2. Ejecuta `npm run lint` antes de hacer commit
3. Mantén los tipos TypeScript actualizados
4. Documenta los cambios importantes

## 📄 Licencia

Este proyecto es privado.

---

**Desarrollado con ❤️ usando React + TypeScript + Vite**
