# AI Inference Service - Multi-Instance Learning (MIL) for Nodal Metastasis

This microservice provides the dedicated AI inference layer for the Clinical Decision-Support application.

## How Multi-Instance Learning (MIL) is Connected

1. **Biopsy / Whole Slide Ingestion**:
   - The backend sends biopsy histology images (`JPEG`, `PNG`, `TIFF`, `SVS`) to `POST /predict`.

2. **MIL Pipeline Execution**:
   - **Patch Extraction**: Segments tissue areas and extracts $N$ non-overlapping patches ($256 \times 256$ pixels).
   - **Feature Encoding**: Passes each patch through a pre-trained pathology encoder (e.g. CTransPath / ResNet50 / UNI) to generate feature vectors $h_i \in \mathbb{R}^D$.
   - **Attention Aggregation**: Evaluates instance attention weights $a_i$ using gated attention pooling:
     $$a_i = \frac{\exp(w^T(\tanh(Vh_i) \odot \text{sigm}(Uh_i)))}{\sum_j \exp(w^T(\tanh(Vh_j) \odot \text{sigm}(Uh_j)))}$$
   - **Bag-level Risk Score**: Computes bag embedding $M = \sum a_i h_i$ and feeds it to the classification head to output the risk probability for nodal metastasis.

3. **Running the Service**:
   ```bash
   cd ai_service
   pip install -r requirements.txt
   python app.py
   ```
   The service will listen on `http://localhost:8000`.

4. **Connecting to the Web Application**:
   In `backend/.env`, set:
   ```env
   AI_MODE=real
   AI_SERVICE_URL=http://localhost:8000
   ```
