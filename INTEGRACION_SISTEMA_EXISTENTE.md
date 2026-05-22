# Integracion del modulo RRHH en sistema existente

Este proyecto deja de funcionar como sistema independiente y queda preparado como modulo embebible dentro del sistema actual de la empresa.

## Responsabilidades del sistema host

El sistema principal debe seguir controlando:

- login y sesion,
- permisos por usuario,
- trabajadores,
- cargos,
- areas,
- relacion jefe-colaborador,
- persistencia en base de datos,
- layout principal, menu general y cierre de sesion.

El modulo RRHH debe recibir esos datos y enfocarse solo en:

- listar encuestas activas para trabajadores,
- llenar encuestas en ventana flotante,
- listar evaluaciones asignadas a jefes,
- llenar evaluaciones en ventana flotante,
- administrar encuestas desde RRHH,
- mostrar seguimiento y reporteria.

## Contrato de entrada

Antes de montar el bundle Angular, el sistema host debe definir:

```html
<script>
  window.__RRHH_MODULE_CONTEXT__ = {
    mode: 'embedded',
    apiBase: '/api/rrhh',
    currentUser: {
      dni: '10998877',
      name: 'Jefe Demo',
      activeRole: 'jefe',
      roles: ['jefe']
    },
    employees: [
      {
        dni: '40112233',
        name: 'Ana Torres',
        area: 'Importacion',
        position: 'Liquidador',
        bossDni: '10998877',
        climateDone: false,
        performanceDone: false
      }
    ]
  };
</script>
```

Valores permitidos:

- `activeRole`: `trabajador`, `jefe` o `rrhh`.
- `mode`: usar `embedded` dentro del sistema real. El modo `demo` queda solo para GitHub Pages/desarrollo.

## Endpoints esperados

El modulo actualmente conserva compatibilidad con la API demo:

- `GET {apiBase}?action=records`
- `POST {apiBase}?action=climate`
- `POST {apiBase}?action=performance`

Para produccion se recomienda mapear esos endpoints a controladores reales del sistema, por ejemplo:

- `GET /api/rrhh/records`
- `POST /api/rrhh/surveys/{surveyId}/responses`
- `POST /api/rrhh/performance/{employeeDni}/responses`
- `GET /api/rrhh/surveys/active`
- `GET /api/rrhh/employees/by-boss/{bossDni}`

## Cambios ya preparados

- El modulo ya puede arrancar sin login propio cuando `mode` es `embedded`.
- El rol inicial sale de `currentUser.activeRole`.
- Los trabajadores salen de `employees`, no de una base interna cuando se embebe.
- El boton `Cerrar sesion` se oculta en modo embebido.
- `apiBase` se recibe desde el sistema host.

## Pendiente recomendado

- Extraer la persistencia de encuestas, avances y evaluaciones a servicios Angular separados.
- Reemplazar `localStorage` por endpoints reales de avances/respuestas.
- Conectar el editor de encuestas a tablas reales.
- Recibir cargos, areas y organigrama desde la base del sistema host.
- Si el sistema host ya tiene router Angular, montar este modulo como ruta hija en vez de aplicacion completa.
