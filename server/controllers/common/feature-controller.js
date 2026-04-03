const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;
    const featureImages = new Feature({ image });
    await featureImages.save();

    res.status(201).json({ success: true, data: featureImages });
  } catch (e) {
    res.status(500).json({ success: false, message: "Error occured!" });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});
    res.status(200).json({ success: true, data: images });
  } catch (e) {
    res.status(500).json({ success: false, message: "Error occured!" });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Feature.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Error occured!" });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };