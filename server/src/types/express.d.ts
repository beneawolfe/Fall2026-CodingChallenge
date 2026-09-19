// Adds the authenticated user's id to Express requests
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};