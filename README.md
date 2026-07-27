<div align="center">

<img src="public/assets/images/logo-plantealo.svg" width="84" height="84" alt="Plantealo" />

# PLANTEALO

### Tu Huerto Inteligente

**Plantealo** es una plataforma integral desarrollada en **Angular + FastAPI** diseñada para transformar la experiencia de cultivar en casa. Desde el control climático hasta la mesa, esta app te ayuda a gestionar los tiempos de vida de tus plantas, cocinar con lo que cosechas, intercambiar excedentes con otros usuarios y conectar con la comunidad de agricultores urbanos.

[![Angular](https://img.shields.io/badge/Angular-21-B5C99A?logo=angular&logoColor=black)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-B5C99A?logo=typescript&logoColor=black)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-B5C99A?logo=fastapi&logoColor=black)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Aiven-B5C99A?logo=postgresql&logoColor=black)](https://aiven.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-B5C99A?logo=firebase&logoColor=black)](https://firebase.google.com/)

**[Funcionalidades](#-funcionalidades-destacadas) · [Stack](#️-stack-tecnológico) · [Estructura](#-estructura-del-repositorio) · [Instalación](#️-instalación-y-ejecución) · [Tests](#-tests)**

</div>

---

## 🌟 Funcionalidades Destacadas

### 🌦️ Panel de Control (Dashboard)
- **Monitoreo en Tiempo Real:** Temperatura, humedad y condiciones actuales vía AEMET.
- **Previsión Inteligente:** Calendario semanal meteorológico para planificar riegos y evitar sorpresas con la lluvia.
- **Smart To-Do List:** Listado dinámico de tareas (regar, cosechar, revisar plantas enfermas).
- **Recomendaciones de temporada:** Qué plantar cada mes y receta sugerida con lo que ya tienes en el huerto.

### 🌿 Gestión del Huerto (Plantas)
- **Inventario Digital:** Seguimiento individualizado de cada cultivo, con soporte para repetir la misma especie varias veces.
- **Algoritmo de Cosecha:** Barra de progreso basada en el tiempo de crecimiento; avisa cuando está lista.
- **Ficha Técnica:** Frecuencia de riego, horas de sol necesarias y fecha estimada de cosecha.
- **Historial:** Registro de todas las plantas que has gestionado alguna vez, incluidas las ya cosechadas.

### 🥗 Recetario Saludable
- **Filtros Dietéticos:** Vegana, vegetariana u omnívora, y por categoría (principal, entrante, postre...).
- **Aprovechamiento Real:** La app calcula qué porcentaje de la receta puedes cubrir con lo que tienes listo en tu huerto.
- **Recetas guardadas:** Marca tus favoritas para encontrarlas rápido desde tu perfil.
- **Detalles:** Dificultad, tiempo estimado, ingredientes e instrucciones paso a paso.

### 📸 Comunidad
- **Social Feed:** Publica fotos de tus cosechas, recetas o consejos de huerto.
- **Interacción:** "Me gusta", comentarios y guardado de publicaciones.
- **Seguimiento:** Sigue a otros usuarios de la comunidad.

### 🔄 Intercambios
- **Mercado de excedentes:** Publica las plantas o cosecha que te sobran para intercambiar con otros usuarios.
- **Filtros por ciudad y planta** para encontrar intercambios cercanos.
- **Contacto directo** por email con quien ofrece el intercambio.

### 🤖 Asistente de Jardinería (IA)
- Chat flotante disponible en toda la app, con contexto de tus propias plantas.
- Responde dudas de riego, plagas, cuidados y clima; admite fotos para diagnóstico visual.

### 👤 Perfil y Cuenta
- **Perfil:** foto, datos personales, estadísticas del huerto (clicables → historial completo) y recetas/publicaciones guardadas.
- **Configuración:** editar nombre, preferencia alimentaria y foto; selector de idioma.
- **Seguridad:** cambiar contraseña y eliminar cuenta (con confirmación doble e irreversible).
- **Login con email/contraseña o con Google.**

---

## 🛠️ Stack Tecnológico

**Frontend**
- Angular 21 (standalone components, signals) + TypeScript + SCSS
- Angular Material, Ionic, iconos [Lucide](https://lucide.dev/)
- Firebase Auth (email/contraseña + Google) — el resto de datos vive en el backend propio

**Backend**
- Python + [FastAPI](https://fastapi.tiangolo.com/) + SQLAlchemy
- PostgreSQL alojado en [Aiven](https://aiven.io/)
- Almacenamiento de avatares en disco (servido como estáticos por FastAPI)

**Integraciones externas**
- [AEMET OpenData](https://opendata.aemet.es/) — datos meteorológicos reales
- [Groq](https://groq.com/) — modelo de IA para el asistente de jardinería (texto e imagen)

**Despliegue**
- Frontend: build de Angular (según entorno de hosting elegido)
- Backend: [Render](https://render.com/) (`environment.prod.ts` apunta a `https://plantealo.onrender.com`)

---

## 📁 Estructura del repositorio

```
Plantealo/
├── src/app/            # Frontend Angular (páginas, componentes, servicios)
├── backend/            # API FastAPI
│   ├── main.py         # Endpoints
│   ├── models.py       # Modelos SQLAlchemy
│   ├── schemas.py      # Esquemas Pydantic
│   ├── crud.py         # Lógica de acceso a datos
│   └── requirements.txt
└── public/             # Assets estáticos (imágenes)
```

---

## 🏗️ Instalación y Ejecución

La app necesita **dos servidores corriendo a la vez**: el backend (FastAPI) y el frontend (Angular). Sin el backend arrancado, el frontend no podrá cargar plantas, recetas, ni iniciar sesión correctamente (usa `http://localhost:8000` por defecto en desarrollo).

### 1. Clonar el repositorio
```bash
git clone https://github.com/AlmaQm/Plantealo.git
cd Plantealo
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Crea un archivo `backend/.env` con:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/basededatos
GROQ_API_KEY=tu_api_key_de_groq
AEMET_API_KEY=tu_api_key_de_aemet
BACKEND_URL=http://localhost:8000
```

Arranca el servidor (por defecto en `http://localhost:8000`):

```bash
uvicorn main:app --reload
```

### 3. Frontend (Angular)

Se recomienda usar la versión LTS de Node.js:
```bash
nvm install lts
nvm use lts
```

Desde la raíz del proyecto:
```bash
npm install
npm start
```

La app quedará disponible en **http://localhost:4200/**.

### 4. Firebase

El proyecto de Firebase ya está configurado en `src/environments/environment.ts` (Auth con email/contraseña y Google). Si usas tu propio proyecto de Firebase, sustituye `firebaseConfig` por el tuyo y habilita ambos proveedores en la consola de Firebase Authentication.

---

## 🧪 Tests

```bash
npm test
```
