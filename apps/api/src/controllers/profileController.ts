import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User context not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        preparationTypes: user.preparationTypes,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User context not found' });
    }

    const { name, username, preparationTypes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // If changing username, check if new username is already taken
    if (username && username.toLowerCase().trim() !== user.username) {
      const targetUsername = username.toLowerCase().trim();
      const existingUser = await User.findOne({ username: targetUsername });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = targetUsername;
    }

    if (name) {
      user.name = name.trim();
    }

    if (preparationTypes !== undefined) {
      user.preparationTypes = preparationTypes;
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        preparationTypes: user.preparationTypes,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user profile' });
  }
};
