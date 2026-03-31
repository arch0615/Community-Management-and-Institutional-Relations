import { Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: Error, user: AuthUser) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Forbidden: Super Admin access required" });
  }
  next();
};
