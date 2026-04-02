const Policy = require("../models/Policy");
const Request = require("../models/Request");
const Risk = require("../models/Risk");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ policies: [], requests: [], risks: [] });
    }

    const regex = new RegExp(q, "i");

    const [policies, requests, risks] = await Promise.all([
      Policy.find({
        $or: [{ title: regex }, { description: regex }]
      }).limit(5).select("title description status"),
      
      Request.find({
        $or: [{ title: regex }, { description: regex }]
      }).limit(5).select("title description status"),

      Risk.find({
        $or: [{ title: regex }, { description: regex }]
      }).limit(5).select("title description status likelihood impact")
    ]);

    res.json({
      policies,
      requests,
      risks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { globalSearch };
