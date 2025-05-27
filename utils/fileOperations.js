import fs from 'fs';
import path from 'path';

// Get the project's root directory
const projectRoot = process.cwd();

// Function to read JSON file using a path relative to the project root
export const readJSONFile = (filePath) => {
  // Construct the absolute path by joining the project root and the relative path
  const absolutePath = path.join(projectRoot, filePath);
  try {
    const jsonData = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error reading file from ${absolutePath}:`, error);
    return null;
  }
};

// Function to write JSON file using a path relative to the project root
export const writeJSONFile = (filePath, data) => {
  // Construct the absolute path by joining the project root and the relative path
  const absolutePath = path.join(projectRoot, filePath);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(absolutePath, jsonString);
    return true;
  } catch (error) {
    console.error(`Error writing to file ${absolutePath}:`, error);
    return false;
  }
};