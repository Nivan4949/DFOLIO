import { Request, Response, NextFunction } from 'express';

// Generic validation helper function
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Validation Error: Missing required fields: [${missingFields.join(', ')}]`,
      });
    }

    next();
  };
};

// Validate project input
export const validateProjectInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, startDate } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Validation Error: Project name is required and must be a string.' });
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({ error: 'Validation Error: Invalid startDate date format.' });
  }

  next();
};

// Validate task input
export const validateTaskInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, projectId, startDate, endDate, progress, priority, status } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Validation Error: Task name is required.' });
  }

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Validation Error: projectId is required.' });
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({ error: 'Validation Error: Invalid startDate format.' });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({ error: 'Validation Error: Invalid endDate format.' });
  }

  if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
    return res.status(400).json({ error: 'Validation Error: Progress must be a number between 0 and 100.' });
  }

  const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'HOLD', 'INSPECTION', 'COMPLETED'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Validation Error: Invalid task status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `Validation Error: Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
  }

  next();
};

// Validate snag input
export const validateSnagInput = (req: Request, res: Response, next: NextFunction) => {
  const { title, projectId, roomId, priority, status } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Validation Error: Snag title is required.' });
  }

  if (!projectId || !roomId) {
    return res.status(400).json({ error: 'Validation Error: projectId and roomId are required.' });
  }

  const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Validation Error: Invalid snag status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `Validation Error: Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
  }

  next();
};
