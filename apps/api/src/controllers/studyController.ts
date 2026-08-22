import { Response } from 'express';
import { Types } from 'mongoose';
import { getLocalDateKey } from '@studyos/utils';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Subject } from '../models/Subject';
import { Note } from '../models/Note';
import { StudySession } from '../models/StudySession';
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

const serializeNote = (note: any, subjectsMap?: Map<string, any>) => {
  const subject = note.subjectId && subjectsMap ? subjectsMap.get(note.subjectId.toString()) : null;

  return {
    id: note._id.toString(),
    userId: note.userId.toString(),
    subjectId: note.subjectId ? note.subjectId.toString() : undefined,
    subjectName: subject?.name,
    subjectColor: subject?.color,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
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

const getLocalDayStart = (date: Date = new Date()) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

const getLocalWeekStart = (date: Date = new Date()) => {
  const localDate = getLocalDayStart(date);
  const day = localDate.getDay();
  const offset = (day + 6) % 7;
  localDate.setDate(localDate.getDate() - offset);
  return localDate;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const serializeSession = (session: any, subjectsMap?: Map<string, any>) => {
  const subject = session.subjectId && subjectsMap ? subjectsMap.get(session.subjectId.toString()) : null;

  return {
    id: session._id.toString(),
    userId: session.userId.toString(),
    subjectId: session.subjectId.toString(),
    subjectName: subject?.name,
    subjectColor: subject?.color,
    title: session.title,
    note: session.note,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    sessionDate: session.sessionDate,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
};

const buildStudySessionMetrics = (subjects: any[], sessions: any[]) => {
  const todayKey = getLocalDateKey();
  const weekStartKey = getLocalDateKey(getLocalWeekStart());
  const subjectsMap = subjectLookup(subjects);
  const sortedSessions = [...sessions].sort(
    (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime(),
  );

  const totalStudySeconds = sortedSessions.reduce(
    (total, session) => total + Number(session.durationSeconds || 0),
    0,
  );

  const todayStudySeconds = sortedSessions
    .filter((session) => session.sessionDate === todayKey)
    .reduce((total, session) => total + Number(session.durationSeconds || 0), 0);

  const weeklyStudySeconds = sortedSessions
    .filter((session) => session.sessionDate >= weekStartKey && session.sessionDate <= todayKey)
    .reduce((total, session) => total + Number(session.durationSeconds || 0), 0);

  const completedStudySessionCount = sortedSessions.length;
  const averageSessionSeconds =
    completedStudySessionCount === 0 ? 0 : Math.round(totalStudySeconds / completedStudySessionCount);
  const longestSessionSeconds = sortedSessions.reduce(
    (longest, session) => Math.max(longest, Number(session.durationSeconds || 0)),
    0,
  );

  const dateSet = new Set(sortedSessions.map((session) => session.sessionDate));

  let currentStreakDays = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const dateKey = getLocalDateKey(date);
    if (!dateSet.has(dateKey)) {
      break;
    }
    currentStreakDays += 1;
  }

  const subjectTotals = new Map<string, { studySeconds: number; sessionCount: number }>();
  sortedSessions.forEach((session) => {
    const subjectId = session.subjectId.toString();
    const current = subjectTotals.get(subjectId) || { studySeconds: 0, sessionCount: 0 };
    current.studySeconds += Number(session.durationSeconds || 0);
    current.sessionCount += 1;
    subjectTotals.set(subjectId, current);
  });

  const subjectStudyTime = subjects
    .map((subject) => {
      const totals = subjectTotals.get(subject._id.toString()) || { studySeconds: 0, sessionCount: 0 };
      const totalTopics = subject.topics.length;
      const completedTopics = subject.topics.filter((topic: any) => topic.status === 'Completed').length;

      return {
        subjectId: subject._id.toString(),
        subjectName: subject.name,
        subjectColor: subject.color,
        studySeconds: totals.studySeconds,
        sessionCount: totals.sessionCount,
        progressPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
      };
    })
    .filter((subject) => subject.studySeconds > 0)
    .sort((left, right) => right.studySeconds - left.studySeconds);

  const dailyActivity = [] as Array<{ date: string; label: string; studySeconds: number; sessionCount: number }>;
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const dateKey = getLocalDateKey(date);
    const daySessions = sortedSessions.filter((session) => session.sessionDate === dateKey);

    dailyActivity.push({
      date: dateKey,
      label: formatDateLabel(date),
      studySeconds: daySessions.reduce((total, session) => total + Number(session.durationSeconds || 0), 0),
      sessionCount: daySessions.length,
    });
  }

  const activeDays = dailyActivity.filter((day) => day.studySeconds > 0).length;
  const consistencyPercentage = Math.round((activeDays / dailyActivity.length) * 100);

  const totalTopics = subjects.reduce((total, subject) => total + subject.topics.length, 0);
  const completedTopics = subjects.reduce(
    (total, subject) => total + subject.topics.filter((topic: any) => topic.status === 'Completed').length,
    0,
  );

  return {
    totalStudySeconds,
    todayStudySeconds,
    weeklyStudySeconds,
    completedStudySessionCount,
    averageSessionSeconds,
    longestSessionSeconds,
    activeDays,
    consistencyPercentage,
    currentStreakDays,
    recentSessions: sortedSessions.slice(0, 5).map((session) => serializeSession(session, subjectsMap)),
    subjectStudyTime,
    dailyActivity,
    syllabus: {
      totalTopics,
      completedTopics,
      progressPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
      subjectProgress: subjects.map((subject) => {
        const subjectCompletedTopics = subject.topics.filter((topic: any) => topic.status === 'Completed').length;
        const subjectTotalTopics = subject.topics.length;
        return {
          subjectId: subject._id.toString(),
          subjectName: subject.name,
          completedTopics: subjectCompletedTopics,
          totalTopics: subjectTotalTopics,
          progressPercentage:
            subjectTotalTopics === 0 ? 0 : Math.round((subjectCompletedTopics / subjectTotalTopics) * 100),
        };
      }),
    },
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

    const [subjects, tasks, sessions, notes] = await Promise.all([
      Subject.find({ userId }).sort({ createdAt: -1 }),
      StudyTask.find({ userId }).sort({ scheduledDate: 1, createdAt: -1 }),
      StudySession.find({ userId }).sort({ startedAt: -1 }),
      Note.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }),
    ]);

    const todayKey = typeof req.query.date === 'string' ? req.query.date : getLocalDateKey();
    const subjectsMap = subjectLookup(subjects);
    const todayTasks = tasks.filter((task) => task.scheduledDate === todayKey);
    const todayCompletedTasks = todayTasks.filter((task) => task.status === 'Completed').length;
    const todayPendingTasks = todayTasks.filter((task) => task.status !== 'Completed').length;
    const syllabusProgress = buildSubjectProgress(subjects);
    const sessionMetrics = buildStudySessionMetrics(subjects, sessions);
    const recentNotes = notes.slice(0, 3).map((note) => serializeNote(note, subjectsMap));

    return res.status(200).json({
      subjectCount: subjects.length,
      totalTaskCount: tasks.length,
      todayTaskCount: todayTasks.length,
      todayPendingTasks,
      todayCompletedTasks,
      syllabusProgress: syllabusProgress.progressPercentage,
      syllabusCompletedTopics: syllabusProgress.completedTopics,
      syllabusTotalTopics: syllabusProgress.totalTopics,
      totalStudySeconds: sessionMetrics.totalStudySeconds,
      todayStudySeconds: sessionMetrics.todayStudySeconds,
      weeklyStudySeconds: sessionMetrics.weeklyStudySeconds,
      completedStudySessionCount: sessionMetrics.completedStudySessionCount,
      recentStudySessions: sessionMetrics.recentSessions,
      noteCount: notes.length,
      recentNotes,
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

export const listStudySessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const querySchema = z.object({
      subjectId: z.string().trim().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      offset: z.coerce.number().int().min(0).default(0).optional(),
    });

    const parsedQuery = querySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        message: 'Invalid session query',
        errors: parsedQuery.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { subjectId } = parsedQuery.data;
    const limit = parsedQuery.data.limit ?? 20;
    const offset = parsedQuery.data.offset ?? 0;
    const filter: Record<string, unknown> = { userId };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const [sessions, subjects, totalCount, allSessions] = await Promise.all([
      StudySession.find(filter).sort({ startedAt: -1 }).skip(offset).limit(limit),
      Subject.find({ userId }),
      StudySession.countDocuments(filter),
      StudySession.find({ userId }).sort({ startedAt: -1 }),
    ]);

    const metrics = buildStudySessionMetrics(subjects, allSessions);
    const subjectsMap = subjectLookup(subjects);

    return res.status(200).json({
      sessions: sessions.map((session) => serializeSession(session, subjectsMap)),
      totalCount,
      totalStudySeconds: metrics.totalStudySeconds,
      todayStudySeconds: metrics.todayStudySeconds,
      weeklyStudySeconds: metrics.weeklyStudySeconds,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch study sessions' });
  }
};

export const createStudySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { subjectId, title, note, startedAt, endedAt, durationSeconds } = req.body;

    if (endedAt.getTime() <= startedAt.getTime()) {
      return res.status(400).json({ message: 'Session end time must be after the start time' });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Selected subject not found' });
    }

    const session = await StudySession.create({
      userId: new Types.ObjectId(userId),
      subjectId: new Types.ObjectId(subjectId),
      title: title?.trim() || undefined,
      note: note?.trim() || undefined,
      startedAt,
      endedAt,
      durationSeconds,
      sessionDate: getLocalDateKey(startedAt),
      status: 'Completed',
    });

    return res.status(201).json({
      message: 'Study session saved successfully',
      session: serializeSession(session, new Map([[subject._id.toString(), subject]])),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save study session' });
  }
};

export const updateStudySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const session = await StudySession.findOne({ _id: req.params.sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    const { subjectId, title, note, startedAt, endedAt, durationSeconds } = req.body;

    if (subjectId !== undefined) {
      const subject = await Subject.findOne({ _id: subjectId, userId });
      if (!subject) {
        return res.status(404).json({ message: 'Selected subject not found' });
      }
      session.subjectId = new Types.ObjectId(subjectId);
    }

    if (title !== undefined) session.title = title?.trim() || undefined;
    if (note !== undefined) session.note = note?.trim() || undefined;
    if (startedAt !== undefined) session.startedAt = startedAt;
    if (endedAt !== undefined) session.endedAt = endedAt;
    if (durationSeconds !== undefined) session.durationSeconds = durationSeconds;

    if (session.endedAt.getTime() <= session.startedAt.getTime()) {
      return res.status(400).json({ message: 'Session end time must be after the start time' });
    }

    session.sessionDate = getLocalDateKey(session.startedAt);
    await session.save();

    const subjects = await Subject.find({ userId });
    return res.status(200).json({
      message: 'Study session updated successfully',
      session: serializeSession(session, subjectLookup(subjects)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update study session' });
  }
};

export const deleteStudySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const session = await StudySession.findOneAndDelete({ _id: req.params.sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    return res.status(200).json({ message: 'Study session deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete study session' });
  }
};

export const getStudyAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const querySchema = z.object({
      days: z.coerce.number().int().min(7).max(30).default(7).optional(),
    });

    const parsedQuery = querySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        message: 'Invalid analytics query',
        errors: parsedQuery.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const [subjects, sessions] = await Promise.all([
      Subject.find({ userId }).sort({ createdAt: -1 }),
      StudySession.find({ userId }).sort({ startedAt: -1 }),
    ]);

    const metrics = buildStudySessionMetrics(subjects, sessions);
    const days = parsedQuery.data.days ?? 7;

    return res.status(200).json({
      ...metrics,
      dailyActivity: metrics.dailyActivity.slice(-days),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch study analytics' });
  }
};