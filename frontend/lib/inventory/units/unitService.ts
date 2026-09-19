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
    if (!product.unitConversions || Object.keys(product.unitConversions).length === 0) {
      return `${product.currentStock} ${product.baseUnit}`;
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
    
    if (maxFactor > 0 && product.currentStock >= maxFactor) {
        const majorCount = Math.floor(product.currentStock / maxFactor);
        const remainder = Number((product.currentStock % maxFactor).toFixed(3));
        if (remainder > 0) {
            return `${majorCount} ${maxUnit} and ${remainder} ${product.baseUnit}`;
        }
        return `${majorCount} ${maxUnit}`;
    }
    return `${product.currentStock} ${product.baseUnit}`;
  }

  /**
   * Normalize an input quantity and unit to the product's base unit.
   * Prioritizes product-specific configured trade unit conversions.
   */
  public normalize(product: Product, quantity: number, inputUnit: string): NormalizationResult {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }

    const cleanInput = inputUnit.trim();
    const cleanInputLower = cleanInput.toLowerCase();
    const baseUnitLower = product.baseUnit.trim().toLowerCase();

    // 1. Direct match with product's base unit
    if (cleanInputLower === baseUnitLower) {
      return {
        normalizedQuantity: quantity,
        normalizedUnit: product.baseUnit,
        factor: 1,
        note: `Direct ${product.baseUnit}`,
      };
    }

    // 2. Check product-specific custom unit conversions
    if (product.unitConversions) {
      for (const [unitKey, factor] of Object.entries(product.unitConversions)) {
        if (
          unitKey.toLowerCase() === cleanInputLower ||
          this.isAliasMatch(unitKey, cleanInputLower)
        ) {
          const normalizedQuantity = Number((quantity * factor).toFixed(3));
          return {
            normalizedQuantity,
            normalizedUnit: product.baseUnit,
            factor,
            note: `1 ${unitKey} = ${factor} ${product.baseUnit} (Custom Product Config)`,
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
          normalizedUnit: product.baseUnit,
          factor,
          note: `1 ${def.label} = ${factor} ${product.baseUnit} (Standard)`,
        };
      }
    }

    // If unit is identical in alias to base unit (e.g. 'kgs' for 'kg', 'pcs' for 'piece', 'litres' for 'litre')
    const baseDef = this.findUnitDefinition(product.baseUnit);
    if (baseDef && baseDef.aliases.includes(cleanInputLower)) {
      return {
        normalizedQuantity: quantity,
        normalizedUnit: product.baseUnit,
        factor: 1,
        note: `Direct ${product.baseUnit}`,
      };
    }

    throw new Error(
      `Cannot convert unit "${inputUnit}" to base unit "${product.baseUnit}" for ${product.name}. Please configure a conversion rule (e.g. 1 ${inputUnit} = X ${product.baseUnit}).`
    );
  }

  private isAliasMatch(unitName: string, query: string): boolean {
    const def = this.findUnitDefinition(unitName);
    if (!def) return false;
    return def.aliases.some((a) => a.toLowerCase() === query.toLowerCase());
  }
}

export const unitService = new UnitService();
