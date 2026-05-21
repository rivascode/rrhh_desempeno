# rrhh_desempeno

Aplicacion web para gestionar **encuestas de clima laboral**, **evaluaciones de desempeno** y **reporteria RRHH**. El proyecto toma como base los documentos de `documentos_base` y los convierte en flujos web separados por portal.

## Portales

### 1. Portal trabajador

- Acceso por DNI, contrasena y seleccion de portal.
- Permite llenar la encuesta de clima laboral.
- La encuesta usa preguntas editables configuradas por RRHH.
- Soporta respuestas tipo seleccion simple, texto corto, texto largo y escala 0 a 10.

### 2. Portal jefe

- Acceso por DNI del jefe.
- Lista colaboradores del area/equipo asignado.
- Permite registrar evaluacion de desempeno tipo CONECTA.
- Incluye competencias, evidencia, objetivos, potencial, capacitacion y feedback.

### 3. Portal RRHH

- Acceso interno por DNI.
- Dashboard de clima laboral y desempeno.
- Seguimiento de llenado: completados y pendientes.
- Recordatorios simulados para encuesta/evaluacion.
- Programacion de proceso.
- Exportacion de resultados en JSON.
- Editor de encuestas estilo Google Forms:
  - agregar preguntas,
  - editar preguntas,
  - duplicar preguntas,
  - eliminar preguntas,
  - marcar requerido/no requerido,
  - seleccionar tipo de respuesta.

## Tecnologias

- **Frontend:** Angular 21, TypeScript, HTML, CSS.
- **Backend:** PHP 8 compatible, API REST simple.
- **Persistencia backend:** JSON local en `backend/data/records.json`.
- **Persistencia demo frontend:** `localStorage` cuando el backend PHP no esta levantado.
- **Deploy frontend:** GitHub Pages mediante rama `gh-pages`.
- **Analisis documental:** Python y Node scripts en `tools/`.

## Estructura del proyecto

```text
rrhh_desempeno/
  analysis/                 Resumen funcional y extracciones de documentos
  backend/
    api/index.php           API PHP
    data/                   Persistencia local JSON
  documentos_base/          Archivos Excel, XLS y DOCX originales
  frontend/                 Aplicacion Angular
    src/app/                Componentes, estilos y data base
  tools/                    Scripts de extraccion/analisis documental
```

## Requisitos locales

- Node.js 22 LTS recomendado.
- npm.
- PHP instalado y disponible en `PATH` para usar el backend local.
- Git.

> Nota: en desarrollo local la app puede funcionar sin PHP porque guarda temporalmente en `localStorage`; para persistencia compartida se debe levantar el backend.

## Instalar dependencias

```powershell
cd D:\DEV\rrhh_desempeno\frontend
npm install
```

## Levantar frontend Angular

```powershell
cd D:\DEV\rrhh_desempeno\frontend
npm start -- --host 127.0.0.1 --port 4200
```

Abrir:

```text
http://127.0.0.1:4200/
```

## Levantar backend PHP

```powershell
cd D:\DEV\rrhh_desempeno
php -S 127.0.0.1:8081 -t backend
```

Endpoints principales:

```text
GET  http://127.0.0.1:8081/api/index.php?action=health
GET  http://127.0.0.1:8081/api/index.php?action=records
GET  http://127.0.0.1:8081/api/index.php?action=summary
POST http://127.0.0.1:8081/api/index.php?action=climate
POST http://127.0.0.1:8081/api/index.php?action=performance
```

## Compilar frontend

Build local:

```powershell
cd D:\DEV\rrhh_desempeno\frontend
npm run build
```

Build para GitHub Pages:

```powershell
cd D:\DEV\rrhh_desempeno\frontend
npm run build -- --base-href /rrhh_desempeno/
```

La salida queda en:

```text
frontend/dist/frontend/browser
```

## Deploy en GitHub Pages

Este repositorio usa despliegue por rama `gh-pages`.

Flujo:

1. Compilar Angular con `--base-href /rrhh_desempeno/`.
2. Publicar el contenido de `frontend/dist/frontend/browser` en la rama `gh-pages`.
3. Configurar GitHub Pages para servir desde `gh-pages` y carpeta raiz.

URL esperada:

```text
https://rivascode.github.io/rrhh_desempeno/
```

## Notas de implementacion

- El login separa roles por portal, pero aun es una simulacion de autenticacion. El siguiente paso tecnico es conectar usuarios reales por DNI y contrasena contra una base de datos o servicio interno.
- El editor de encuestas de RRHH guarda la configuracion en `localStorage` en esta version. Para produccion debe persistirse en backend.
- Los documentos originales se mantienen en `documentos_base` como referencia funcional.
- El backend PHP actual esta preparado como API simple; puede evolucionar a MySQL/PostgreSQL sin cambiar el frontend de forma profunda.
