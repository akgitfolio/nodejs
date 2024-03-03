import { validate } from "class-validator";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

import { AppDataSource } from "../datasource";
import { User } from "../entity/User";

class AuthController {
  static login = async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).send();
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      res.status(401).send();
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env["JWT_SECRET"],
      { expiresIn: "1h" }
    );

    res.send({ token, username: user.username, role: user.role });
  };

  static register = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).send("Username and password are required");
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).send("Username already exists");
      return;
    }

    const newUser = new User();
    newUser.username = username;
    newUser.password = password;
    newUser.role = "user";

    newUser.hashPassword();

    const errors = await validate(newUser);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    await userRepository.save(newUser);

    res.status(201).send("User registered successfully");
  };

  static changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;

    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  };
}
export default AuthController;
