// utils/azureExpenseStorage.js
const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const EXPENSE_PROOFS_CONTAINER_NAME = 'expense-proofs';

// Initialize Blob Service Client
const getBlobServiceClient = () => {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage connection string is not configured');
  }
  return BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
};

// Get container client
const getContainerClient = async () => {
  try {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(EXPENSE_PROOFS_CONTAINER_NAME);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'blob'
    });
    
    return containerClient;
  } catch (error) {
    console.error('Error getting container client:', error);
    throw new Error('Failed to initialize Azure Storage container');
  }
};

// Upload expense proof to Azure Blob Storage
const uploadExpenseProofToBlob = async (file) => {
  if (!file || !file.buffer) {
    console.log('No file or buffer provided for upload');
    return null;
  }

  try {
    const containerClient = await getContainerClient();
    
    // Generate unique blob name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9); // 7 characters
    
    // Get file extension
    let fileExtension = 'jpg'; // default
    if (file.originalname && file.originalname.includes('.')) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      // Only allow safe extensions
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'heic', 'webp'];
      if (allowedExtensions.includes(ext)) {
        fileExtension = ext;
      }
    } else if (file.mimetype) {
      // Extract extension from mimetype
      const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'image/heic': 'heic',
        'image/webp': 'webp'
      };
      fileExtension = mimeToExt[file.mimetype] || 'jpg';
    }

    // Create simple blob name: timestamp-random.ext
    const blobName = `${timestamp}-${randomString}.${fileExtension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Determine content type
    const contentType = file.mimetype || 'application/octet-stream';
    
    // Upload the file with Cool tier
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { 
        blobContentType: contentType 
      },
      tier: 'Cool'
    });

    console.log(`✅ Expense proof uploaded: ${blobName}`);
    return blockBlobClient.url;
    
  } catch (error) {
    console.error('❌ Error uploading expense proof to blob:', error.message);
    throw new Error(`Failed to upload expense proof: ${error.message}`);
  }
};

// Delete expense proof from Azure Blob Storage
const deleteExpenseProofFromBlob = async (proofUrl) => {
  if (!proofUrl) {
    console.log('No proof URL provided for deletion');
    return false;
  }

  try {
    // Extract blob name from URL
    let blobName;
    
    if (proofUrl.includes('.blob.core.windows.net/')) {
      // Full Azure Blob URL
      const url = new URL(proofUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      
      // Remove container name from path
      // Path format: /container-name/blob-path
      if (pathParts.length > 1) {
        // Check if first part is container name
        if (pathParts[0] === EXPENSE_PROOFS_CONTAINER_NAME) {
          blobName = pathParts.slice(1).join('/');
        } else {
          blobName = pathParts.join('/');
        }
      } else {
        // Only one part, that's the blob name
        blobName = pathParts[0];
      }
    } else {
      // Assume it's just the blob name
      blobName = proofUrl;
    }

    if (!blobName) {
      console.error('❌ Could not extract blob name from URL:', proofUrl);
      return false;
    }

    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const deleteResponse = await blockBlobClient.deleteIfExists();
    
    if (deleteResponse.succeeded) {
      console.log(`✅ Expense proof deleted: ${blobName}`);
      return true;
    } else {
      console.log(`⚠️ Expense proof not found: ${blobName}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error deleting expense proof from URL ${proofUrl}:`, error.message);
    return false;
  }
};

// Get SAS URL for temporary access (optional, for frontend direct access)
const generateSasUrl = async (blobUrl, expiryInMinutes = 60) => {
  try {
    // Extract blob name from URL
    let blobName;
    
    if (blobUrl.includes('.blob.core.windows.net/')) {
      const url = new URL(blobUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      
      if (pathParts[0] === EXPENSE_PROOFS_CONTAINER_NAME) {
        blobName = pathParts.slice(1).join('/');
      } else {
        blobName = pathParts.join('/');
      }
    } else {
      blobName = blobUrl;
    }

    if (!blobName) {
      console.error('❌ Could not extract blob name for SAS URL');
      return blobUrl;
    }

    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryInMinutes);
    
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: 'r', // Read only
      expiresOn: expiryDate
    });
    
    return sasUrl;
  } catch (error) {
    console.error('❌ Error generating SAS URL:', error.message);
    return blobUrl; // Fallback to original URL
  }
};

// Check if blob exists (optional helper)
const blobExists = async (blobUrl) => {
  try {
    const blobName = extractBlobName(blobUrl);
    if (!blobName) return false;

    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const exists = await blockBlobClient.exists();
    return exists;
  } catch (error) {
    console.error('❌ Error checking blob existence:', error.message);
    return false;
  }
};

// Helper to extract blob name from URL
const extractBlobName = (url) => {
  try {
    if (!url.includes('://')) {
      return url; // Already a blob name
    }
    
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    
    if (pathParts[0] === EXPENSE_PROOFS_CONTAINER_NAME) {
      return pathParts.slice(1).join('/');
    }
    return pathParts.join('/');
  } catch (error) {
    // If not a valid URL, return as is
    return url;
  }
};

// List all proofs (for admin)
const listAllProofs = async () => {
  try {
    const containerClient = await getContainerClient();
    const blobs = [];
    
    // List all blobs
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push({
        name: blob.name,
        url: `${containerClient.url}/${blob.name}`,
        size: blob.properties.contentLength,
        lastModified: blob.properties.lastModified
      });
    }
    
    return blobs;
  } catch (error) {
    console.error('❌ Error listing proofs:', error.message);
    throw new Error('Failed to list expense proofs');
  }
};

// List proofs by filename pattern
const listProofsByPattern = async (pattern) => {
  try {
    const containerClient = await getContainerClient();
    const blobs = [];
    
    // List all blobs and filter by pattern
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.includes(pattern)) {
        blobs.push({
          name: blob.name,
          url: `${containerClient.url}/${blob.name}`,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified
        });
      }
    }
    
    return blobs;
  } catch (error) {
    console.error('❌ Error listing proofs by pattern:', error.message);
    throw new Error('Failed to list expense proofs');
  }
};

// Get blob metadata
const getBlobMetadata = async (blobUrl) => {
  try {
    const blobName = extractBlobName(blobUrl);
    if (!blobName) return null;

    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const properties = await blockBlobClient.getProperties();
    
    return {
      name: blobName,
      url: blockBlobClient.url,
      size: properties.contentLength,
      contentType: properties.contentType,
      lastModified: properties.lastModified,
      metadata: properties.metadata || {},
      accessTier: properties.accessTier
    };
  } catch (error) {
    console.error('❌ Error getting blob metadata:', error.message);
    return null;
  }
};

module.exports = {
  uploadExpenseProofToBlob,
  deleteExpenseProofFromBlob,
  generateSasUrl,
  blobExists,
  extractBlobName,
  listAllProofs,
  listProofsByPattern,
  getBlobMetadata
};