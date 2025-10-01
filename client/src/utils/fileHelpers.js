export const downloadFile = (data, filename, mimeType = 'application/octet-stream') => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const generateFilename = (baseName, extension, separator = '_') => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, separator);
  return `${sanitizedName}${separator}${timestamp}.${extension}`;
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
};

export const isValidFileSize = (file, maxSizeMB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};