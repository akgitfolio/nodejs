import { Request, Response } from "express";
import { resizeImage } from "@/utils/image";

export default {
  resizeImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { width, height } = req.query;
      const resizedImage = await resizeImage(
        ((req as any).file as any).buffer,
        Number(width),
        Number(height)
      );
      res.contentType("image/jpeg");
      res.send(resizedImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
};
