#!/usr/bin/env node
import * as fs from 'fs';
import XLSX from 'xlsx';

const filePath = '/Users/john/Dev/Personal/azbusiness/data/imports/T6022TL3_reviews (1).xlsx';

try {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('📊 Excel File Analysis');
  console.log('=====================');
  console.log(`Total rows: ${data.length}`);
  console.log(`\nColumns found:`);
  if (data.length > 0) {
    console.log(Object.keys(data[0]));
  }
  
  console.log('\n📝 First 3 reviews sample:');
  console.log('========================');
  data.slice(0, 3).forEach((row: any, index: number) => {
    console.log(`\nReview ${index + 1}:`);
    Object.entries(row).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  });
  
} catch (error) {
  console.error('Error reading Excel file:', error);
}