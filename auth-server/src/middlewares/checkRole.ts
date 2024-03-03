import { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../datasource";
import { User } from "../entity/User";

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.jwtPayload.userId;

    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({
        where: {
          id,
        },
      });

      if (roles.indexOf(user.role) > -1) next();
      else res.status(401).send();
    } catch (id) {
      res.status(401).send();
    }
  };
};
