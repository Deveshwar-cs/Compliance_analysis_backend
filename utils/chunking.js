export const chunkFramework = (framework) => {
  const chunks = [];

  if (!framework.controls || framework.controls.length === 0) {
    const text = `Framework: ${framework.name} (${framework.shortCode})
Description: ${framework.description || "No description provided."}
Authority: ${framework.authority || "N/A"}`;

    chunks.push({
      text,
      metadata: {
        frameworkId: framework._id.toString(),
        frameworkUuid: framework.uuid,
        frameworkName: framework.name,
        shortCode: framework.shortCode,
        isGeneralDescription: true,
        productTypes: [], // no restriction
      },
    });

    return chunks;
  }

  framework.controls.forEach((control) => {
    const text = `Framework: ${framework.name} (${framework.shortCode})
Control ID: ${control.controlId} - ${control.title}
Requirement: ${control.requirementText || "N/A"}
Description: ${control.description || "N/A"}
Risk Level: ${control.riskLevel}
Mandatory: ${control.mandatory ? "Yes" : "No"}
Weight: ${control.weight}
Applicable Product Types: ${
      control.productTypes && control.productTypes.length > 0
        ? control.productTypes.join(", ")
        : "All"
    }
Tags: ${
      control.tags && control.tags.length > 0 ? control.tags.join(", ") : "None"
    }`;

    chunks.push({
      text,
      metadata: {
        frameworkId: framework._id.toString(),
        frameworkUuid: framework.uuid,
        frameworkName: framework.name,
        shortCode: framework.shortCode,
        controlId: control.controlId,
        controlTitle: control.title,
        riskLevel: control.riskLevel,
        isMandatory: control.mandatory,
        weight: control.weight,
        productTypes: control.productTypes || [], // <-- added for filtering
        industries: control.industries || [], // <-- added for filtering
      },
    });
  });

  return chunks;
};
