import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for the lead."],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address."],
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified"],
      default: "New",
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);