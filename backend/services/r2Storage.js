const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/**
 * Cloudflare R2 Storage Service
 * Handles uploading generated audio files to R2, retrieving public URLs,
 * and deleting files. Fully S3-compatible.
 */

// We get these from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'YOUR_R2_ACCOUNT_ID_HERE';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'YOUR_R2_ACCESS_KEY_HERE';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'YOUR_R2_SECRET_KEY_HERE';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'voxar';
const R2_PUBLIC_URL_PREFIX = process.env.R2_PUBLIC_URL_PREFIX || 'https://audio.voxar.in';

// Important: the endpoint must exactly match Cloudflare's required format
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload an audio buffer to Cloudflare R2
 * @param {Buffer} buffer - The file buffer to upload
 * @param {String} filename - The destination filename (e.g. "generated/tts_1234.mp3")
 * @param {String} contentType - MIME type (e.g. "audio/mpeg" or "audio/wav")
 * @returns {String} The public URL to the uploaded file
 */
async function uploadAudio(buffer, filename, contentType = 'audio/mpeg') {
  console.log(`[R2 Storage] Uploading ${filename} to R2...`);
  
  const uploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Return the public URL that maps to the Cloudflare CDN domain
    return getAudioUrl(filename);
  } catch (error) {
    console.error('[R2 Storage] Upload error:', error.message);
    throw new Error('Failed to upload file to storage bucket.');
  }
}

/**
 * Get the public CDN URL for a stored file
 * @param {String} filename - The filename/path inside the bucket
 * @returns {String} Public URL
 */
function getAudioUrl(filename) {
  // Ensure the prefix doesn't have a trailing slash, and filename doesn't have a leading slash
  const baseUrl = R2_PUBLIC_URL_PREFIX.replace(/\/$/, "");
  const path = filename.replace(/^\//, "");
  
  return `${baseUrl}/${path}`;
}

/**
 * Get a temporary, pre-signed download URL for a file (useful for private bucket items)
 * (Though for VOXAR, the bucket or at least the paths are likely public behind CDN)
 */
async function getPresignedUrl(filename, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('[R2 Storage] Presigned URL error:', error.message);
    throw error;
  }
}

/**
 * Delete a file from the bucket
 * @param {String} filename
 */
async function deleteAudio(filename) {
  console.log(`[R2 Storage] Deleting ${filename} from R2...`);
  
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('[R2 Storage] Delete error:', error.message);
    throw new Error('Failed to delete file from storage bucket.');
  }
}

module.exports = {
  uploadAudio,
  getAudioUrl,
  getPresignedUrl,
  deleteAudio
};
