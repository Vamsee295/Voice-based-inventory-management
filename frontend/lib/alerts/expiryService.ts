import { InventoryBatch, ExpiryStatus } from '../inventory/models/batch';
import { batchRepository } from '../inventory/repositories/batchRepository';

export class ExpiryService {
  /**
   * Calculates the number of days remaining until expiry.
   * If the date is in the past, returns a negative number.
   * If today, returns 0.
   */
  static getDaysRemaining(expiryDateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getStatus(expiryDateStr: string): ExpiryStatus {
    const daysRemaining = this.getDaysRemaining(expiryDateStr);

    if (daysRemaining < 0) return 'EXPIRED';
    if (daysRemaining === 0) return 'EXPIRING_TODAY';
    if (daysRemaining > 0 && daysRemaining <= 3) return 'EXPIRING_SOON';
    if (daysRemaining > 3 && daysRemaining <= 7) return 'UPCOMING';
    return 'SAFE';
  }

  static async getBatchesRequiringAttention(): Promise<InventoryBatch[]> {
    const allBatches = await batchRepository.getAll();
    return allBatches
      .filter((batch) => this.getStatus(batch.expiryDate) !== 'SAFE')
      .sort((a, b) => {
        const daysA = this.getDaysRemaining(a.expiryDate);
        const daysB = this.getDaysRemaining(b.expiryDate);
        return daysA - daysB; // Ascending order (lowest days first)
      });
  }

  static async getExpirySummaryForVoice(): Promise<{ responseText: string }> {
    const allBatches = await batchRepository.getAll();
    const expiringSoonBatches = allBatches.filter(
      (b) => {
        const status = this.getStatus(b.expiryDate);
        return status === 'EXPIRED' || status === 'EXPIRING_TODAY' || status === 'EXPIRING_SOON' || status === 'UPCOMING';
      }
    );

    if (expiringSoonBatches.length === 0) {
      return { responseText: 'No products are expiring soon.' };
    }

    const count = expiringSoonBatches.length;
    let text = `${count} product${count > 1 ? 's' : ''} require${count === 1 ? 's' : ''} attention. `;

    // Group by product name for natural speech
    const limited = expiringSoonBatches.slice(0, 3); // Read out top 3 to avoid long speech
    
    limited.forEach(batch => {
      const days = this.getDaysRemaining(batch.expiryDate);
      if (days < 0) {
        text += `${batch.productName} has expired. `;
      } else if (days === 0) {
        text += `${batch.productName} expires today. `;
      } else {
        text += `${batch.productName} expires in ${days} days. `;
      }
    });

    if (count > 3) {
      text += `And ${count - 3} more. Please check the expiry dashboard.`;
    }

    return { responseText: text };
  }
}
