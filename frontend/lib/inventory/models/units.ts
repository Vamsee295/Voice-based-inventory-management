export type BaseUnit = 'kg' | 'gram' | 'litre' | 'piece';

export type OperationalUnit =
  | 'bag'
  | 'carton'
  | 'box'
  | 'dozen'
  | 'bottle'
  | 'packet'
  | 'katta'
  | 'dabba'
  | 'tin'
  | 'quintal';

export interface UnitDefinition {
  code: string;
  label: string;
  vernacular?: string;
  category: 'base' | 'operational' | 'trade';
  defaultBaseUnit?: BaseUnit;
  defaultFactor?: number; // multiplier to defaultBaseUnit if standard
  isConfigurable: boolean;
  aliases: string[];
}

export const SUPPORTED_UNITS: UnitDefinition[] = [
  // Base units
  { code: 'kg', label: 'Kilogram (kg)', category: 'base', isConfigurable: false, aliases: ['kg', 'kgs', 'kilogram', 'kilograms'] },
  { code: 'gram', label: 'Gram (g)', category: 'base', isConfigurable: false, aliases: ['g', 'gm', 'gms', 'gram', 'grams'] },
  { code: 'litre', label: 'Litre (L)', category: 'base', isConfigurable: false, aliases: ['l', 'ltr', 'litre', 'litres', 'liter', 'liters'] },
  { code: 'piece', label: 'Piece (pcs)', category: 'base', isConfigurable: false, aliases: ['pc', 'pcs', 'piece', 'pieces'] },

  // Operational units
  { code: 'packet', label: 'Packet', category: 'operational', isConfigurable: true, aliases: ['packet', 'packets', 'pkt', 'pkts', 'ప్యాకెట్'] },
  { code: 'box', label: 'Box', category: 'operational', isConfigurable: true, aliases: ['box', 'boxes', 'పెట్టె'] },
  { code: 'carton', label: 'Carton', category: 'operational', isConfigurable: true, aliases: ['carton', 'cartons', 'ctn'] },
  { code: 'bottle', label: 'Bottle', category: 'operational', isConfigurable: true, aliases: ['bottle', 'bottles', 'బాటిల్'] },
  { code: 'dozen', label: 'Dozen (12 pcs)', category: 'operational', defaultBaseUnit: 'piece', defaultFactor: 12, isConfigurable: false, aliases: ['dozen', 'dozens', 'dz', 'డజన్'] },

  // Indian trade units (TUNE)
  { code: 'bag', label: 'Bag', vernacular: 'బస్తా (Basta)', category: 'trade', defaultBaseUnit: 'kg', defaultFactor: 25, isConfigurable: true, aliases: ['bag', 'bags', 'basta', 'బస్తా'] },
  { code: 'katta', label: 'Katta', vernacular: 'కట్టా (Katta)', category: 'trade', defaultBaseUnit: 'kg', defaultFactor: 50, isConfigurable: true, aliases: ['katta', 'katte', 'కట్టా'] },
  { code: 'dabba', label: 'Dabba / Tin', vernacular: 'డబ్బా (Dabba)', category: 'trade', defaultBaseUnit: 'litre', defaultFactor: 15, isConfigurable: true, aliases: ['dabba', 'dabbas', 'tin', 'tins', 'డబ్బా'] },
  { code: 'quintal', label: 'Quintal (100 kg)', vernacular: 'క్వింటాల్', category: 'trade', defaultBaseUnit: 'kg', defaultFactor: 100, isConfigurable: false, aliases: ['quintal', 'quintals', 'qtl', 'క్వింటాల్'] },
];
