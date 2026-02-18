const Policy = require("../models/Policy");
const sendNotification = require("../utils/notificationService");

// CREATE POLICY
const createPolicy = async (req, res) => {
  try {
    const { title, description, version, status } = req.body;

    const policy = await Policy.create({
      title,
      description,
      version,
      status,
      createdBy: req.user._id
    });

    // Notify all employees about new policy
const employees = await User.find({ role: "Employee" });

for (let emp of employees) {
  await sendNotification(emp._id, `New policy created: ${policy.title}`);
}


    res.status(201).json({
      message: "Policy created successfully",
      policy
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL POLICIES
const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().populate("createdBy", "name email");

    res.json(policies);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE POLICY
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    policy.title = req.body.title || policy.title;
    policy.description = req.body.description || policy.description;
    policy.version = req.body.version || policy.version;
    policy.status = req.body.status || policy.status;

    const updatedPolicy = await policy.save();

    res.json({
      message: "Policy updated successfully",
      updatedPolicy
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE POLICY
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    await policy.deleteOne();

    res.json({ message: "Policy deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { 
    createPolicy,
    getPolicies,
    updatePolicy,
    deletePolicy };
