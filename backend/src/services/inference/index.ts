import { config } from '../../config/env';
import { IInferenceService } from './inferenceInterface';
import { DemoInferenceService } from './demoInferenceService';
import { RealInferenceService } from './realInferenceService';
import { logger } from '../../utils/logger';

let inferenceServiceInstance: IInferenceService;

export const getInferenceService = (): IInferenceService => {
  if (!inferenceServiceInstance) {
    if (config.ai.mode === 'real') {
      logger.info(`Initializing AI Inference layer in REAL mode connecting to ${config.ai.serviceUrl}`);
      inferenceServiceInstance = new RealInferenceService();
    } else {
      logger.info('Initializing AI Inference layer in DEMO mode (simulated Multi-Instance Learning)');
      inferenceServiceInstance = new DemoInferenceService();
    }
  }
  return inferenceServiceInstance;
};

export * from './inferenceInterface';
export * from './demoInferenceService';
export * from './realInferenceService';
