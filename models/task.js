const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  fromTime: {
    type: Date,
    required: true,
  },
  toTime: {
    type: Date,
    required: true,
  },
}, {
  toJSON: { virtuals: false },
  toObject: { virtuals: false },
});

taskSchema.virtual('duration').get(function() {
  return (this.toTime - this.fromTime) / (1000 * 60 * 60);
});

taskSchema.virtual('day').get(function() {
  const fromDate = new Date(this.fromTime);
  fromDate.setHours(0, 0, 0, 0);
  return fromDate;
});

taskSchema.pre('save', async function(next) {
  const task = this;
  const isUpdating = !task.isNew
  const duration = task.duration;
  
  if (duration > 8) {
    return next(new Error('Task duration cannot exceed 8 hours.'));
  }

  const startOfDay = task.day;
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const tasksForDay = await mongoose.model('Task').find({
    fromTime: { $gte: startOfDay, $lte: endOfDay },
  });
  let totalDuration = tasksForDay.reduce((acc, t) => acc + t.duration, 0);


  if(isUpdating) {
    const originalTask = await mongoose.model('Task').findById(task._id);
    if (originalTask) {
      totalDuration -= originalTask.duration;
    }

  }
  if (totalDuration + duration > 8) {
    return next(new Error('Total task duration for the day cannot exceed 8 hours.'));
  }

  next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
