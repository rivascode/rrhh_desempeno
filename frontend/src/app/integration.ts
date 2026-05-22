import { PortalRole } from './types';

export interface HostUser {
  dni: string;
  name: string;
  activeRole: PortalRole;
  roles: PortalRole[];
}

export interface HostEmployee {
  dni: string;
  name: string;
  area: string;
  position: string;
  bossDni: string;
  climateDone?: boolean;
  performanceDone?: boolean;
}

export interface RrhhModuleContext {
  mode: 'embedded' | 'demo';
  apiBase?: string;
  currentUser: HostUser;
  employees: HostEmployee[];
}

declare global {
  interface Window {
    __RRHH_MODULE_CONTEXT__?: RrhhModuleContext;
  }
}

export const demoContext: RrhhModuleContext = {
  mode: 'demo',
  apiBase: 'http://127.0.0.1:8081/api/index.php',
  currentUser: {
    dni: '40112233',
    name: 'Usuario demo',
    activeRole: 'trabajador',
    roles: ['trabajador', 'jefe', 'rrhh'],
  },
  employees: [
    { dni: '40112233', name: 'Ana Torres', area: 'Importacion', position: 'Liquidador', bossDni: '10998877', climateDone: false, performanceDone: false },
    { dni: '42114455', name: 'Carlos Medina', area: 'Exportacion', position: 'Sectorista', bossDni: '10998877', climateDone: true, performanceDone: false },
    { dni: '43889911', name: 'Lucia Rojas', area: 'Sistemas', position: 'Analista', bossDni: '10887766', climateDone: false, performanceDone: true },
    { dni: '45667788', name: 'Miguel Salas', area: 'Contabilidad', position: 'Asistente', bossDni: '10776655', climateDone: true, performanceDone: true },
  ],
};

export function getModuleContext(): RrhhModuleContext {
  return window.__RRHH_MODULE_CONTEXT__ ?? demoContext;
}
