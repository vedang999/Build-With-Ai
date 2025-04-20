const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Sends KML content to Liquid Galaxy
 * @param {string} kmlContent - KML content to send
 * @param {string} filename - Name of the KML file
 * @returns {Promise<void>}
 */
async function sendKMLToLG(kmlContent, filename) {
  try {
    // Path to save the temporary KML file
    const tempDir = path.join(__dirname, '../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    
    // Write KML content to file
    fs.writeFileSync(filePath, kmlContent);
    
    // Command to copy KML to all LG nodes and open it
    // Note: Adjust this command based on your LG setup
    const lgCopyCommand = `scp ${filePath} lg@lg1:/var/www/html/kml/`;
    const lgLoadCommand = `ssh lg@lg1 "echo 'flytoview=${buildFlyToView(filename)}' > /tmp/query.txt"`;
    
    // Execute commands
    await execPromise(lgCopyCommand);
    await execPromise(lgLoadCommand);
    
    console.log(`KML sent to Liquid Galaxy: ${filename}`);
  } catch (error) {
    console.error('Error sending KML to Liquid Galaxy:', error);
    throw error;
  }
}

/**
 * Builds a flyToView command for the KML file
 * @param {string} filename - Name of the KML file
 * @returns {string} - flyToView command
 */
function buildFlyToView(filename) {
  return `<gx:duration>3</gx:duration><gx:flyToMode>smooth</gx:flyToMode><href>http://lg1:81/kml/${filename}</href>`;
}

module.exports = {
  sendKMLToLG
};