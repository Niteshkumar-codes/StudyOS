import { Response } from 'express';
import { Types } from 'mongoose';
import { getLocalDateKey } from '@studyos/utils';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Subject } from '../models/Subject';
import { StudyTask } from '../models/StudyTask';

const serializeTopic = (topic: any) => ({
  id: topic._id.toString(),
  title: topic.title,
  status: topic.status,
  createdAt: topic.createdAt.toISOString(),
  updatedAt: topic.updatedAt.toISOString(),
});

const serializeSubject = (subject: any) => {
  const topics = (subject.topics || []).map(serializeTopic);
  const totalTopics = topics.length;
  const completedTopics = topics.filter((topic: any) => topic.status === 'Completed').length;

  return {
    id: subject._id.toString(),
    examId: subject.examId,
    name: subject.name,
    description: subject.description,
    color: subject.color,
    icon: subject.icon,
    topics,
    totalTopics,
    completedTopics,
    progressPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  };
};

const subjectLookup = (subjects: any[]) => {
  const map = new Map<string, any>();
  subjects.forEach((subject) => {
    map.set(subject._id.toString(), subject);
  });
  return map;
};

const serializeTask = (task: any, subjectsMap?: Map<string, any>) => {
  const subject = task.subjectId && subjectsMap ? subjectsMap.get(task.subjectId.toString()) : null;

  return {
    id: task._id.toString(),
    subjectId: task.subjectId ? task.subjectId.toString() : undefined,
    subjectName: subject?.name,
    subjectColor: subject?.color,
    title: task.title,
    description: task.description,
    scheduledDate: task.scheduledDate,
    durationMinutes: task.durationMinutes,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
};

const buildSubjectProgress = (subjects: any[]) => {
  const totalTopics = subjects.reduce((total, subject) => total + subject.topics.length, 0);
  const completedTopics = subjects.reduce(
    (total, subject) =>
      total + subject.topics.filter((topic: any) => topic.status === 'Completed').length,
    0,
  );

  return {
    totalTopics,
    completedTopics,
    progressPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
  };
};

const getUserId = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'User context not found' });
    return null;
  }
  return userId;
};

export const getStudySummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const [subjects, tasks] = await Promise.all([
      Subject.find({ userId }).sort({ createdAt: -1 }),
      StudyTask.find({ userId }).sort({ scheduledDate: 1, createdAt: -1 }),
    ]);

    const todayKey = typeof req.query.date === 'string' ? req.query.date : getLocalDateKey();
    const subjectsMap = subjectLookup(subjects);
    const todayTasks = tasks.filter((task) => task.scheduledDate === todayKey);
    const todayCompletedTasks = todayTasks.filter((task) => task.status === 'Completed').length;
    const todayPendingTasks = todayTasks.filter((task) => task.status !== 'Completed').length;
    const syllabusProgress = buildSubjectProgress(subjects);

    return res.status(200).json({
      subjectCount: subjects.length,
      totalTaskCount: tasks.length,
      todayTaskCount: todayTasks.length,
      todayPendingTasks,
      todayCompletedTasks,
      syllabusProgress: syllabusProgress.progressPercentage,
      syllabusCompletedTopics: syllabusProgress.completedTopics,
      syllabusTotalTopics: syllabusProgress.totalTopics,
      subjects: subjects.map(serializeSubject),
      todayTasks: todayTasks.map((task) => serializeTask(task, subjectsMap)),
      tasks: tasks.map((task) => serializeTask(task, subjectsMap)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch study summary' });
  }
};

export const listSubjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subjects = await Subject.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ subjects: subjects.map(serializeSubject) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

export const getSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subject = await Subject.findOne({ _id: req.params.subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json({ subject: serializeSubject(subject) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch subject' });
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name, description, examId, color, icon } = req.body;

    const subject = await Subject.create({
      userId: new Types.ObjectId(userId),
      name: name.trim(),
      description: description?.trim() || undefined,
      examId: examId ? examId.trim() : undefined,
      color: color?.trim() || undefined,
      icon: icon?.trim() || undefined,
      topics: [],
    });

    return res.status(201).json({
      message: 'Subject created successfully',
      subject: serializeSubject(subject),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create subject' });
  }
};

export const updateSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subject = await Subject.findOne({ _id: req.params.subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, description, examId, color, icon } = req.body;

    if (name !== undefined) subject.name = name.trim();
    if (description !== undefined) subject.description = description?.trim() || undefined;
    if (examId !== undefined) subject.examId = examId ? examId.trim() : undefined;
    if (color !== undefined) subject.color = color?.trim() || undefined;
    if (icon !== undefined) subject.icon = icon?.trim() || undefined;

    await subject.save();

    return res.status(200).json({
      message: 'Subject updated successfully',
      subject: serializeSubject(subject),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update subject' });
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subject = await Subject.findOneAndDelete({ _id: req.params.subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await StudyTask.deleteMany({ userId, subjectId: subject._id });

    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete subject' });
  }
};

export const addSubjectTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subject = await Subject.findOne({ _id: req.params.subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { title, status } = req.body;
    subject.topics.push({
      title: title.trim(),
      status: status || 'Not Started',
    } as any);

    await subject.save();
    const createdTopic = subject.topics[subject.topics.length - 1];

    return res.status(201).json({
      message: 'Topic added successfully',
      subject: serializeSubject(subject),
      topic: serializeTopic(createdTopic),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add topic' });
  }
};

export const updateSubjectTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subject = await Subject.findOne({ _id: req.params.subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topic = subject.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const { title, status } = req.body;
    if (title !== undefined) topic.title = title.trim();
    if (status !== undefined) topic.status = status;

    await subject.save();

    return res.status(200).json({
      message: 'Topic updated successfully',
      subject: serializeSubject(subject),
      topic: serializeTopic(topic),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update topic' });
  }
};

export const deleteSubjectTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const subject = await Subject.findOne({ _id: req.params.subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topic = subject.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    subject.topics.pull(req.params.topicId);
    await subject.save();

    return res.status(200).json({
      message: 'Topic deleted successfully',
      subject: serializeSubject(subject),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete topic' });
  }
};

export const listTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const filter: Record<string, unknown> = { userId };
    if (date) {
      filter.scheduledDate = date;
    }

    const [tasks, subjects] = await Promise.all([
      StudyTask.find(filter).sort({ scheduledDate: 1, createdAt: -1 }),
      Subject.find({ userId }),
    ]);

    const subjectsMap = subjectLookup(subjects);

    return res.status(200).json({ tasks: tasks.map((task) => serializeTask(task, subjectsMap)) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch study tasks' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { subjectId, title, description, scheduledDate, durationMinutes, status } = req.body;

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId });
      if (!subject) {
        return res.status(404).json({ message: 'Selected subject not found' });
      }
    }

    const task = await StudyTask.create({
      userId: new Types.ObjectId(userId),
      subjectId: subjectId ? new Types.ObjectId(subjectId) : undefined,
      title: title.trim(),
      description: description?.trim() || undefined,
      scheduledDate,
      durationMinutes,
      status,
    });

    const subjects = await Subject.find({ userId });
    return res.status(201).json({
      message: 'Study task created successfully',
      task: serializeTask(task, subjectLookup(subjects)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create study task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const task = await StudyTask.findOne({ _id: req.params.taskId, userId });
    if (!task) {
      return res.status(404).json({ message: 'Study task not found' });
    }

    const { subjectId, title, description, scheduledDate, durationMinutes, status } = req.body;

    if (subjectId !== undefined) {
      if (subjectId) {
        const subject = await Subject.findOne({ _id: subjectId, userId });
        if (!subject) {
          return res.status(404).json({ message: 'Selected subject not found' });
        }
        task.subjectId = new Types.ObjectId(subjectId);
      } else {
        task.subjectId = undefined;
      }
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim() || undefined;
    if (scheduledDate !== undefined) task.scheduledDate = scheduledDate;
    if (durationMinutes !== undefined) task.durationMinutes = durationMinutes;
    if (status !== undefined) task.status = status;

    await task.save();

    const subjects = await Subject.find({ userId });
    return res.status(200).json({
      message: 'Study task updated successfully',
      task: serializeTask(task, subjectLookup(subjects)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update study task' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const task = await StudyTask.findOneAndDelete({ _id: req.params.taskId, userId });
    if (!task) {
      return res.status(404).json({ message: 'Study task not found' });
    }

    return res.status(200).json({ message: 'Study task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete study task' });
  }
};