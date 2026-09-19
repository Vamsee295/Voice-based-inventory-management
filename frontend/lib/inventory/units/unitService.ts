import { Product } from '../models/product';
import { SUPPORTED_UNITS, UnitDefinition } from '../models/units';

export interface NormalizationResult {
  normalizedQuantity: number;
  normalizedUnit: string;
  factor: number;
  note?: string;
}

export class UnitService {
  /**
   * Find matching unit definition by name, code, or alias
   */
  public findUnitDefinition(unitStr: string): UnitDefinition | undefined {
    const clean = unitStr.trim().toLowerCase();
    return SUPPORTED_UNITS.find(
      (u) =>
        u.code.toLowerCase() === clean ||
        u.label.toLowerCase() === clean ||
        u.aliases.some((a) => a.toLowerCase() === clean)
    );
  }

  /**
   * Check if a unit is valid and supported
   */
  public isUnitSupported(unitStr: string): boolean {
    return !!this.findUnitDefinition(unitStr);
  }

  /**
   * Format stock into natural language using largest configured trade unit
   */
  public formatStock(product: Product): string {
    if (!product) return '0 units';
    const baseUnit = product.baseUnit || 'units';
    if (!product.unitConversions || Object.keys(product.unitConversions).length === 0) {
      return `${product.currentStock ?? 0} ${baseUnit}`;
    }
    
    // Find the largest unit conversion
    let maxUnit = '';
    let maxFactor = 0;
    for (const [unit, factor] of Object.entries(product.unitConversions)) {
       if (factor > maxFactor) {
           maxFactor = factor;
           maxUnit = unit;
       }
    }
    
    const stock = product.currentStock ?? 0;
    if (maxFactor > 0 && stock >= maxFactor) {
        const majorCount = Math.floor(stock / maxFactor);
        const remainder = Number((stock % maxFactor).toFixed(3));
        if (remainder > 0) {
            return `${majorCount} ${maxUnit} and ${remainder} ${baseUnit}`;
        }
        return `${majorCount} ${maxUnit}`;
    }
    return `${stock} ${baseUnit}`;
  }

  /**
   * Normalize an input quantity and unit to the product's base unit.
   * Prioritizes product-specific configured trade unit conversions.
   */
  public normalize(product: Product, quantity: number, inputUnit?: string | null): NormalizationResult {
    const baseUnit = (product?.baseUnit || 'unit').trim();
    const baseUnitLower = baseUnit.toLowerCase();

    if (!quantity || quantity <= 0) {
      return {
        normalizedQuantity: 0,
        normalizedUnit: baseUnit,
        factor: 1,
        note: `Zero quantity`,
      };
    }

    const cleanInput = (inputUnit || baseUnit).trim();
    const cleanInputLower = cleanInput.toLowerCase();

    // 1. Direct match with product's base unit
    if (!cleanInput || cleanInputLower === baseUnitLower) {
      return {
        normalizedQuantity: quantity,
        normalizedUnit: baseUnit,
        factor: 1,
        note: `Direct ${baseUnit}`,
      };
    }

    // 2. Check product-specific custom unit conversions
    if (product?.unitConversions) {
      for (const [unitKey, factor] of Object.entries(product.unitConversions)) {
        if (
          unitKey.toLowerCase() === cleanInputLower ||
          this.isAliasMatch(unitKey, cleanInputLower)
        ) {
          const normalizedQuantity = Number((quantity * factor).toFixed(3));
          return {
            normalizedQuantity,
            normalizedUnit: baseUnit,
            factor,
            note: `1 ${unitKey} = ${factor} ${baseUnit} (Custom Product Config)`,
          };
        }
      }
    }

    // 3. Check standard metric conversions (e.g. gram to kg)
    if (cleanInputLower === 'gram' || cleanInputLower === 'g' || cleanInputLower === 'grams') {
      if (baseUnitLower === 'kg') {
        const factor = 0.001;
        return {
          normalizedQuantity: Number((quantity * factor).toFixed(3)),
          normalizedUnit: 'kg',
          factor,
          note: '1000 g = 1 kg',
        };
      }
    }

    // 4. Check standard non-configurable units (e.g. dozen = 12 pcs, quintal = 100 kg)
    const def = this.findUnitDefinition(cleanInput);
    if (def && !def.isConfigurable) {
      if (def.defaultBaseUnit && def.defaultBaseUnit.toLowerCase() === baseUnitLower && def.defaultFactor) {
        const factor = def.defaultFactor;
        const normalizedQuantity = Number((quantity * factor).toFixed(3));
        return {
          normalizedQuantity,
          normalizedUnit: baseUnit,
          factor,
          note: `1 ${def.label} = ${factor} ${baseUnit} (Standard)`,
        };
      }
    }

    // If unit is identical in alias to base unit (e.g. 'kgs' for 'kg', 'pcs' for 'piece', 'litres' for 'litre')
    const baseDef = this.findUnitDefinition(baseUnit);
    if (baseDef && baseDef.aliases.some((a) => a.toLowerCase() === cleanInputLower)) {
      return {
        normalizedQuantity: quantity,
        normalizedUnit: baseUnit,
        factor: 1,
        note: `Direct ${baseUnit}`,
      };
    }

    return {
      normalizedQuantity: quantity,
      normalizedUnit: baseUnit,
      factor: 1,
      note: `1 ${cleanInput} = 1 ${baseUnit} (Direct Conversion)`,
    };
  }

  private isAliasMatch(unitName: string, query: string): boolean {
    const def = this.findUnitDefinition(unitName);
    if (!def) return false;
    return def.aliases.some((a) => a.toLowerCase() === query.toLowerCase());
  }
}

export const unitService = new UnitService();
