import sharp from 'sharp';

sharp.cache(false);

export const resizeImage = async (path: string) => {
  const buffer = await sharp(path)
    .resize(1024, 1024, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();
  return sharp(buffer).toFile(path);
}