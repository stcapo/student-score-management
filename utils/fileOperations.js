import fs from 'fs';
import path from 'path';

// 读取JSON文件
export const readJSONFile = (filePath) => {
  const absolutePath = path.resolve('D:\\AA\\student-grade-system', filePath);
  try {
    const jsonData = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error reading file from ${absolutePath}:`, error);
    return null;
  }
};

// 写入JSON文件
export const writeJSONFile = (filePath, data) => {
  const absolutePath = path.resolve('D:\\AA\\student-grade-system', filePath);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(absolutePath, jsonString);
    return true;
  } catch (error) {
    console.error(`Error writing to file ${absolutePath}:`, error);
    return false;
  }
};
