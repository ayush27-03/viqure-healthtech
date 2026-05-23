async function uploadToCloudinary(buffer, folder, resourceType = "image") {
  const size = Buffer.isBuffer(buffer) ? buffer.length : 0;
  return {
    url: `mock://${folder}/${resourceType}/${Date.now()}-${size}`,
  };
}

module.exports = { uploadToCloudinary };
