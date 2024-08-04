const express = require('express');
const router = express.Router();
const Task = require('../models/task');



router.post('/tasks', async (req, res) => {
  try {
    const { description, fromTime, toTime } = req.body;
    const task = new Task({ description, fromTime, toTime });
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'fromTime', 'toTime'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/summary/:day', async (req, res) => {
  try {
    const day = new Date(req.params.day);
    day.setHours(0, 0, 0, 0); 
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      fromTime: { $gte: day, $lte: endOfDay },
    });
    const totalDuration = tasks.reduce((acc, task) => acc + task.duration, 0);
    const remainingHours = 8 - totalDuration;
    const numOfTasks = tasks.length;

    res.send({
      totalDuration,
      remainingHours,
      numOfTasks,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
