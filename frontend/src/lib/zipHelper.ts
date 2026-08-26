import JSZip from 'jszip';

/**
 * Downloads an array of image URLs as a packaged .zip file directly in the browser
 */
export async function downloadPhotosAsZip(
  photoUrls: string[],
  zipFilename: string = 'event_photos.zip',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (!photoUrls || photoUrls.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder('photos') || zip;

  let completed = 0;
  const total = photoUrls.length;

  await Promise.all(
    photoUrls.map(async (url, index) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();

        let ext = 'jpg';
        if (blob.type.includes('png')) ext = 'png';
        else if (blob.type.includes('webp')) ext = 'webp';
        else if (blob.type.includes('jpeg')) ext = 'jpg';

        const fileName = `photo_${String(index + 1).padStart(3, '0')}.${ext}`;
        folder.file(fileName, blob);
      } catch (err) {
        console.warn(`Failed to fetch photo for zip (${url}):`, err);
      } finally {
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
      }
    })
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
}
