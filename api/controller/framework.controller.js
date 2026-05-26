import {Framework} from "../models/framework.schema.js";
import {chunkFramework} from "../../utils/chunking.js";
import {generateEmbedding} from "../../utils/embeddings.js";
import {qdrantClient} from "../../config/qdrant.js";
import {randomUUID} from "crypto";

export const createFrameWork = async (req, res, next) => {
  try {
    const {
      name,
      shortCode,
      description,
      authority,
      country,
      industry,
      controls,
      version,
      createdBy,
      appliesTo,
    } = req.body;

    if (
      !name ||
      !shortCode ||
      !description ||
      !authority ||
      !country ||
      !industry ||
      !controls ||
      !appliesTo
    ) {
      return res.status(400).json({message: "All fields are required"});
    }
    const findFramework = {
      $or: [{shortCode}, {version}],
    };

    const isFrameworkExist = await Framework.findOne(findFramework);

    if (isFrameworkExist) {
      return res.status(400).json({message: "Framework is already exists"});
    }

    const framework = await Framework.create({
      name,
      shortCode,
      description,
      authority,
      country,
      industry,
      controls,
      version,
      appliesTo,
      createdBy: req.user.id,
    });

    try {
      const chunks = chunkFramework(framework);
      for (const chunk of chunks) {
        const vector = await generateEmbedding(chunk.text);
        await qdrantClient.upsert("frameworks", {
          wait: true,
          points: [
            {
              id: randomUUID(),
              vector: vector,
              payload: {text: chunk.text, ...chunk.metadata},
            },
          ],
        });
      }
    } catch (vectorErr) {
      console.error(
        "❌ Failed to save to Vector DB during creation:",
        vectorErr,
      );
      // Not returning error to user as Mongo save was successful, but logging it.
    }
    // --------------------------------------------------------

    return res.status(201).json({
      data: framework,
    });
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
};

export const getFramework = async (req, res, next) => {
  try {
    const framework = await Framework.find({isActive: true});

    if (!framework || framework.length === 0) {
      res.status(400).json({message: "No framework found!"});
    }
    return res.status(200).json({data: framework});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

export const syncFrameworksToVectorDB = async (req, res, next) => {
  try {
    const frameworks = await Framework.find({isActive: true});

    if (!frameworks || frameworks.length === 0) {
      return res.status(400).json({message: "No framework found to sync"});
    }
    let totalChunksSynced = 0;
    for (const framework of frameworks) {
      const chunks = chunkFramework(framework);

      for (const chunk of chunks) {
        // Generate embedding
        const vector = await generateEmbedding(chunk.text);

        // Save to Qdrant
        await qdrantClient.upsert("frameworks", {
          wait: true,
          points: [
            {
              id: randomUUID(),
              vector: vector,
              payload: {
                text: chunk.text,
                ...chunk.metadata,
              },
            },
          ],
        });
        totalChunksSynced++;
      }
    }
    return res.status(200).json({
      message: `Successfully synced ${frameworks.length} frameworks (${totalChunksSynced} chunks) to Qdrant.`,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
