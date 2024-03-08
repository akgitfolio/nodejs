import { Request, Response } from "express";
import { manipulateImage } from "@/utils/image";

export default {
  manipulateImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { filter } = req.query;
      const manipulatedImage = await manipulateImage(
        ((req as any).file as any).buffer,
        String(filter)
      );
      res.contentType("image/jpeg");
      res.send(manipulatedImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
};
