import {HfInference} from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export const generateEmbedding = async (text) => {
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
      provider: "hf-inference",
    });

    // Flatten in case HF returns nested array
    const vector = Array.isArray(response[0]) ? response[0] : response;

    return vector;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};
