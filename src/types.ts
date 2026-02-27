export interface CompanyInfo {
  name: string;
  address: string;
  vat: string;
  phone: string;
  email: string;
}

export interface PlanMarker {
  id: string;
  x: number;
  y: number;
  rotation: number;
  facadeId: string;
  label: string;
}

export interface SiteInfo {
  address: string;
  client: string;
  manager: string;
  startDate: string;
  employer: string; // Datore di lavoro
  employerAddress: string;
  employerTaxCode: string;
  sitePlan?: string;
  planMarkers?: PlanMarker[];
}

export interface AnchorPoint {
  id: string;
  x: number;
  y: number;
  type: string;
}

export interface ScaffoldingSpec {
  type: string; // e.g., Telai prefabbricati, Tubo e giunto
  brand: string;
  model: string;
  maxHeight: number;
  moduleWidth: number;
  moduleHeight: number;
  specialPieces: string;
  hasShadingNet: boolean;
  hasNightLights: boolean;
  preposto: string;
  facades: FacadeInfo[];
  soilType: string;
  baseElements: string;
  earthingSystem: string;
  signage: string[];
}

export interface ErasedPath {
  points: number[];
  strokeWidth: number;
}

export interface FacadeInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  photo?: string;
  overlayPhoto?: string;
  anchors: AnchorPoint[];
  erasedPaths?: ErasedPath[];
  overlayConfig?: {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    stageWidth: number;
    stageHeight: number;
  };
}

export interface PiMUSData {
  id: string;
  createdAt: string;
  company: CompanyInfo;
  site: SiteInfo;
  team: string[];
  scaffolding: ScaffoldingSpec;
  safetyProcedures: string;
}
