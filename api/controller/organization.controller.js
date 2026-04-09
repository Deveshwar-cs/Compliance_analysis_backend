export const createOrganization = async (req, res, next) => {
  try {
    res.status(201).json({message: "organization created successfully"});
  } catch (error) {
    res.status(500).json({message: error.messsage});
  }
};
