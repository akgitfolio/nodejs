import sharp from "sharp";

export const resizeImage = async (
  buffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> => {
  return await sharp(buffer).resize(width, height).toBuffer();
};

export const manipulateImage = async (
  buffer: Buffer,
  filter: string
): Promise<Buffer> => {
  // Apply desired image manipulations based on the filter parameter
  // using Sharp or other image libraries
  // Example: sharp(buffer).grayscale().toBuffer();
  return buffer;
};
