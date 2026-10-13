import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      required: [true, 'Status is required'],
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.pre('validate', function () {
  if (this.startDate && this.deadline && this.deadline < this.startDate) {
    this.invalidate('deadline', 'Deadline cannot be before the start date');
  }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
