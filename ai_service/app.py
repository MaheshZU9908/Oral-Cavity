from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mil_pipeline import MILPipeline

app = FastAPI(
    title="Clinical AI Multi-Instance Learning Inference Microservice",
    description="Dedicated AI service for Nodal Metastasis Risk Prediction from Biopsy Histology Images",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = MILPipeline()


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": pipeline.model_name,
        "version": pipeline.model_version,
        "mode": "real",
    }


@app.get("/model-info")
async def get_model_info():
    return {
        "name": pipeline.model_name,
        "version": pipeline.model_version,
        "architecture": pipeline.architecture,
        "aggregationMethod": "Gated-Attention Aggregation over instance embeddings",
        "supportedModalities": ["H&E Histopathology", "Biopsy Tissue Section"],
        "mode": "real",
    }


@app.post("/predict")
async def predict_nodal_metastasis(
    file: UploadFile = File(...),
    patient_id: str = Form(None),
    diagnosis: str = Form(None),
):
    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file received.")

        result = pipeline.extract_patches_and_predict(image_bytes, filename=file.filename or "")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
