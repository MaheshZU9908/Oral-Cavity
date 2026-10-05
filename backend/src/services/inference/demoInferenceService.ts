import fs from 'fs';
import crypto from 'crypto';
import { IInferenceService, ModelInferenceResult, ModelInfo } from './inferenceInterface';
import { RiskCategory } from '../../types';
import { logger } from '../../utils/logger';

export class DemoInferenceService implements IInferenceService {
  private readonly modelName = 'MIL-NodalMetastasis-CLAM-Demo';
  private readonly modelVersion = 'v1.4.0-demo';

  async predict(
    imagePath: string,
    metadata?: {
      patientId: string;
      clinicalDiagnosis?: string;
      originalFilename?: string;
    }
  ): Promise<ModelInferenceResult> {
    const startTime = Date.now();
    logger.info(`[DemoInference] Processing histology image in DEMO mode: ${imagePath}`);

    // Read image buffer to generate deterministic hash-based variation
    let hashScore = 0.65;
    try {
      if (fs.existsSync(imagePath)) {
        const fileBuffer = fs.readFileSync(imagePath);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        // Convert first 4 hex chars to number between 0.15 and 0.92
        const intVal = parseInt(hash.substring(0, 4), 16);
        hashScore = 0.12 + (intVal / 65535) * 0.8;
      }
    } catch (e) {
      logger.warn('[DemoInference] Could not read image for hash scoring, using default factor');
    }

    // Simulate network/patch extraction processing latency (300-800ms)
    await new Promise(resolve => setTimeout(resolve, 350));

    const probability = Number(Math.min(0.96, Math.max(0.08, hashScore)).toFixed(4));
    const confidence = Number((0.82 + (Math.abs(probability - 0.5) * 0.3)).toFixed(4));

    let riskCategory: RiskCategory = 'LOW';
    let predictionResult = 'Negative for Nodal Metastasis (Low Risk)';

    if (probability >= 0.70) {
      riskCategory = 'HIGH';
      predictionResult = 'Positive for Nodal Metastasis (High Risk)';
    } else if (probability >= 0.35) {
      riskCategory = 'MODERATE';
      predictionResult = 'Indeterminate / Moderate Risk for Nodal Metastasis';
    }

    // Multi-instance learning patch aggregation simulation
    const totalPatches = Math.floor(96 + Math.random() * 80);
    const highAttentionRatio = riskCategory === 'HIGH' ? 0.22 : riskCategory === 'MODERATE' ? 0.12 : 0.04;
    const highAttentionPatches = Math.max(1, Math.floor(totalPatches * highAttentionRatio));
    const lowRiskPatches = totalPatches - highAttentionPatches - Math.floor(totalPatches * 0.15);
    const moderateRiskPatches = totalPatches - highAttentionPatches - lowRiskPatches;

    const processingTimeMs = Date.now() - startTime;

    return {
      predictionResult,
      riskCategory,
      probability,
      confidence,
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      inferenceMode: 'demo',
      processingTimeMs,
      bagStatistics: {
        totalPatches,
        highAttentionPatches,
        topFeatureScore: Number((probability * 1.05).toFixed(4)),
        aggregationType: 'Attention-based Multi-Instance Learning (CLAM/AB-MIL)',
        patchDistribution: {
          lowRiskPatches: Math.max(0, lowRiskPatches),
          moderateRiskPatches: Math.max(0, moderateRiskPatches),
          highRiskPatches: highAttentionPatches,
        },
      },
      clinicalNotesSuggestion: `Simulated MIL inference: Bag-level aggregation over ${totalPatches} histology patches identified ${highAttentionPatches} high-attention instance clusters. Correlate with immunohistochemistry findings.`,
    };
  }

  async getModelInfo(): Promise<ModelInfo> {
    return {
      name: this.modelName,
      version: this.modelVersion,
      architecture: 'Clustering-constrained Attention Multiple Instance Learning (CLAM-SB)',
      aggregationMethod: 'Gated-Attention Pooling over 20x Whole-Slide Patches',
      supportedModalities: ['H&E Histology', 'Biopsy Section (JPEG/PNG/TIFF/SVS)'],
      mode: 'demo',
      status: 'simulated',
    };
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    mode: 'demo';
    serviceUrl?: string;
    message: string;
  }> {
    return {
      healthy: true,
      mode: 'demo',
      message: 'Demo Multi-Instance Learning inference simulator is active and operational.',
    };
  }
}
