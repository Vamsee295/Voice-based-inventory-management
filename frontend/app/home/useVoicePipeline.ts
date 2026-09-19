import { useState, useEffect } from 'react';
import { SpeechAdapter } from '../../lib/voice/speechAdapter';
import { IntentParser } from '../../lib/voice/intentParser';
import { InventoryQueryService } from '../../lib/assistant/inventoryQueryService';
import { inventoryService } from '../../lib/inventory/services/inventoryService';
import { unitService } from '../../lib/inventory/units/unitService';
import { DemoSession } from './demoData';

export function useVoicePipeline() {
   const [isListening, setIsListening] = useState(false);
   const [speechAdapter, setSpeechAdapter] = useState<SpeechAdapter | null>(null);
   const [activeSession, setActiveSession] = useState<DemoSession | null>(null);

   useEffect(() => {
     const adapter = new SpeechAdapter({
        onStateChange: (state) => {
           setIsListening(state === 'LISTENING' || state === 'TRANSCRIBING');
        },
        onResult: (transcript, isFinal) => {
           if (isFinal) {
              processTranscript(transcript);
           }
        },
        onError: (err) => {
           if (err === 'no-speech') {
              console.log('Voice API: No speech detected (timeout).');
           } else {
              console.error('Speech error:', err);
           }
           setIsListening(false);
        }
     });
     setSpeechAdapter(adapter);
   }, []);

   const processTranscript = async (transcript: string) => {
      const products = await inventoryService.getAllProducts();
      const parseResult = IntentParser.parse(transcript, products);
      
      if (['STOCK_LOOKUP', 'LOW_STOCK_QUERY', 'REORDER_QUERY', 'STOCK_HISTORY', 'EXPIRY_QUERY'].includes(parseResult.intent)) {
          const queryService = new InventoryQueryService(inventoryService, speechAdapter);
          const answer = await queryService.handleQuery(parseResult.intent, parseResult.product);
          
          setActiveSession({
             id: `query-${Date.now()}`,
             tag: 'VOICE QUERY',
             category: 'Inventory Query',
             phrase: transcript,
             language: 'Auto-detected',
             confidence: 0.95,
             intent: parseResult.intent as any,
             intentLabel: parseResult.intent.replace(/_/g, ' '),
             understoodProduct: parseResult.product?.name || 'All/Unknown',
             understoodQuantity: 0,
             understoodUnit: '',
             resolvedSkuName: parseResult.product?.sku || '',
             entities: [],
             transactionPreview: {
                operation: 'QUERY',
                product: parseResult.product?.name || 'Inventory',
                quantity: 'N/A',
                current: 'N/A',
                after: 'N/A',
                source: 'Voice Assistant',
                status: answer,
             }
          });
      } else {
          if (parseResult.error) {
              setActiveSession({
                  id: `err-${Date.now()}`,
                  tag: 'ERROR',
                  category: 'Error',
                  phrase: transcript,
                  language: 'Auto-detected',
                  confidence: 0.95,
                  intent: parseResult.intent as any,
                  intentLabel: 'ERROR',
                  understoodProduct: parseResult.product?.name || 'Unknown',
                  understoodQuantity: parseResult.quantity || 0,
                  understoodUnit: parseResult.unit || '',
                  resolvedSkuName: '',
                  entities: [],
                  transactionPreview: {
                      operation: 'ERROR',
                      product: 'N/A',
                      quantity: 'N/A',
                      current: 'N/A',
                      after: 'N/A',
                      source: 'Voice Console',
                      status: `Validation Error: ${parseResult.error}`
                  }
              });
          } else if (parseResult.product && parseResult.quantity && parseResult.unit) {
              const p = parseResult.product;
              const norm = unitService.normalize(p, parseResult.quantity, parseResult.unit);
              const isOut = parseResult.intent === 'STOCK_OUT';
              
              const currentStock = p.currentStock;
              const delta = norm.normalizedQuantity;
              const newStock = isOut ? currentStock - delta : currentStock + delta;
              
              const isOverdraft = isOut && newStock < 0;
              
              setActiveSession({
                  id: `tx-${Date.now()}`,
                  tag: 'TRANSACTION',
                  category: isOut ? 'Outward' : 'Inward',
                  phrase: transcript,
                  language: 'Auto-detected',
                  confidence: 0.98,
                  intent: parseResult.intent as any,
                  intentLabel: parseResult.intent.replace(/_/g, ' '),
                  understoodProduct: p.name,
                  understoodQuantity: parseResult.quantity,
                  understoodUnit: parseResult.unit,
                  resolvedSkuName: p.sku,
                  entities: [{
                      id: `ent-${Date.now()}`,
                      product: p.name,
                      sku: p.sku,
                      quantity: parseResult.quantity,
                      unit: parseResult.unit,
                      normalized: `${norm.normalizedQuantity} ${norm.normalizedUnit}`,
                      currentStock: `${currentStock} ${p.baseUnit}`,
                      projectedStock: `${newStock} ${p.baseUnit}`,
                      status: isOverdraft ? 'Flagged' : 'Validated',
                      deltaValue: isOut ? -delta : delta,
                      deltaDisplay: isOut ? `-${delta} ${norm.normalizedUnit}` : `+${delta} ${norm.normalizedUnit}`,
                      unitConversionNote: norm.note || undefined,
                  }],
                  transactionPreview: {
                      operation: parseResult.intent.replace('_', ' '),
                      product: p.name,
                      quantity: isOut ? `-${delta} ${norm.normalizedUnit}` : `+${delta} ${norm.normalizedUnit}`,
                      current: `${currentStock} ${p.baseUnit}`,
                      after: `${newStock} ${p.baseUnit}`,
                      source: 'Voice Console',
                      status: isOverdraft ? 'INSUFFICIENT_STOCK' : 'Ready for confirmation',
                  }
              });
          }
      }
   };

   return {
      isListening,
      activeSession,
      setActiveSession,
      processTranscript,
      startListening: () => {
         if (speechAdapter && speechAdapter.checkSupport()) {
             speechAdapter.startListening();
         } else {
             console.warn("Speech API not supported, listening cannot start");
         }
      },
      stopListening: () => speechAdapter?.stopListening()
   };
}
