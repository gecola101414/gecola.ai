export interface CompanyInfo {
  name: string;
  address: string;
  vat: string;
  phone: string;
  email: string;
}

export interface SiteInfo {
  address: string;
  client: string;
  manager: string;
  startDate: string;
}

export interface ScaffoldingSpec {
  type: string; // e.g., Telai prefabbricati, Tubo e giunto
  brand: string;
  model: string;
  maxHeight: number;
  facades: FacadeInfo[];
}

export interface FacadeInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  photo?: string;
  overlayPhoto?: string;
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
  scaffolding: ScaffoldingSpec;
  safetyProcedures: string;
}
