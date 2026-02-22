export interface PriceListItem {
  codice: string;
  descrizione: string;
  unita_misura: string;
  prezzo: number;
  incidenza_mdo: number;
  categoria?: string;
}
