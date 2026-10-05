import fs from 'fs';
import path from 'path';
import { IInferenceService, ModelInferenceResult, ModelInfo } from './inferenceInterface';
import { config } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import { logger } from '../../utils/logger';

export class RealInferenceService implements IInferenceService {
  private serviceUrl: string;
  private timeoutMs: number;

  constructor() {
    this.serviceUrl = config.ai.serviceUrl;
    this.timeoutMs = config.ai.timeoutMs;
  }

  async predict(
    imagePath: string,
    metadata?: {
      patientId: string;
      clinicalDiagnosis?: string;
      originalFilename?: string;
    }
  ): Promise<ModelInferenceResult> {
    const startTime = Date.now();
    logger.info(`[RealInference] Forwarding image to real AI service: ${this.serviceUrl}/predict`);

    if (!fs.existsSync(imagePath)) {
      throw ApiError.badRequest('Biopsy image file does not exist on disk.');
    }

    try {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const fileBuffer = fs.readFileSync(imagePath);
      const filename = path.basename(imagePath);

      // Create multipart payload manually with native fetch or node http
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, filename);
      if (metadata?.patientId) formData.append('patient_id', metadata.patientId);
      if (metadata?.clinicalDiagnosis) formData.append('diagnosis', metadata.clinicalDiagnosis);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown AI Service error');
        throw ApiError.inferenceError(
          `AI Service responded with status ${response.status}: ${errorText}`
        );
      }

      const data: any = await response.json();

      // Validate required fields from real AI service
      if (typeof data.probability !== 'number' || !data.riskCategory) {
        throw ApiError.inferenceError('AI service returned an invalid prediction payload schema.');
      }

      const processingTimeMs = Date.now() - startTime;

      return {
        predictionResult: data.predictionResult || 'Evaluated for Nodal Metastasis',
        riskCategory: data.riskCategory,
        probability: data.probability,
        confidence: data.confidence || 0.85,
        modelName: data.modelName || 'MIL-NodalMetastasis-Trained',
        modelVersion: data.modelVersion || 'v2.0.0',
        inferenceMode: 'real',
        processingTimeMs,
        bagStatistics: data.bagStatistics || {
          totalPatches: data.totalPatches || 100,
          highAttentionPatches: data.highAttentionPatches || 10,
          topFeatureScore: data.probability,
          aggregationType: 'Real Multi-Instance Learning Attention Pooling',
        },
        clinicalNotesSuggestion: data.clinicalNotesSuggestion,
      };
    } catch (err: any) {
      logger.error('[RealInference] Error connecting to real AI service', {
        serviceUrl: this.serviceUrl,
        error: err.message,
      });

      if (err instanceof ApiError) {
        throw err;
      }

      if (err.name === 'AbortError') {
        throw ApiError.inferenceError(
          `AI Inference service timed out after ${this.timeoutMs}ms. Please verify the AI microservice status.`
        );
      }

      throw ApiError.inferenceError(
        `Unable to reach real AI Inference Service at ${this.serviceUrl}. Make sure the Python MIL service is running. Error: ${err.message}`
      );
    }
  }

  async getModelInfo(): Promise<ModelInfo> {
    try {
      const response = await fetch(`${this.serviceUrl}/model-info`);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const data: any = await response.json();
      return {
        name: data.name || 'MIL-NodalMetastasis-Real',
        version: data.version || 'v2.0.0',
        architecture: data.architecture || 'Attention-based Deep Multi-Instance Learning',
        aggregationMethod: data.aggregationMethod || 'Gated Attention Pooling',
        supportedModalities: data.supportedModalities || ['H&E Whole Slide Image'],
        mode: 'real',
        status: 'ready',
      };
    } catch (err: any) {
      return {
        name: 'MIL-NodalMetastasis-Real',
        version: 'v2.0.0',
        architecture: 'Deep Multi-Instance Learning (CLAM / TransMIL)',
        aggregationMethod: 'Gated-Attention Aggregation',
        supportedModalities: ['H&E Whole Slide Image'],
        mode: 'real',
        status: 'offline',
      };
    }
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    mode: 'real';
    serviceUrl: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.serviceUrl}/health`);
      if (response.ok) {
        return {
          healthy: true,
          mode: 'real',
          serviceUrl: this.serviceUrl,
          message: 'Real AI inference service is healthy and connected.',
        };
      }
      return {
        healthy: false,
        mode: 'real',
        serviceUrl: this.serviceUrl,
        message: `Real AI inference service returned status ${response.status}.`,
      };
    } catch (err: any) {
      return {
        healthy: false,
        mode: 'real',
        serviceUrl: this.serviceUrl,
        message: `Failed to reach real AI inference service at ${this.serviceUrl}: ${err.message}`,
      };
    }
  }
}
