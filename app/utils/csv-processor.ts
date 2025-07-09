import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

export interface CSVRow {
  [key: string]: string;
}

export interface CSVProcessorOptions {
  delimiter?: string;
  headers?: string[];
  skipEmptyLines?: boolean;
  mapHeaders?: (header: string) => string;
}

export class CSVProcessor {
  private options: CSVProcessorOptions;

  constructor(options: CSVProcessorOptions = {}) {
    this.options = {
      delimiter: ',',
      skipEmptyLines: true,
      ...options
    };
  }

  /**
   * Read and parse CSV file
   */
  async readCSV(filePath: string): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      const results: CSVRow[] = [];
      
      if (!fs.existsSync(filePath)) {
        reject(new Error(`CSV file not found: ${filePath}`));
        return;
      }

      const csvOptions: any = {
        separator: this.options.delimiter
      };
      
      if (this.options.mapHeaders) {
        csvOptions.mapHeaders = this.options.mapHeaders;
      }

      fs.createReadStream(filePath)
        .pipe(csv(csvOptions))
        .on('data', (row: CSVRow) => {
          results.push(row);
        })
        .on('end', () => {
          console.log(`Successfully parsed ${results.length} rows from ${filePath}`);
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Get CSV files from directory
   */
  getCSVFiles(directory: string): string[] {
    if (!fs.existsSync(directory)) {
      throw new Error(`Directory not found: ${directory}`);
    }

    return fs.readdirSync(directory)
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(directory, file));
  }

  /**
   * Validate required fields in CSV row
   */
  validateRow(row: CSVRow, requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean and normalize field values
   */
  cleanRow(row: CSVRow): CSVRow {
    const cleaned: CSVRow = {};
    
    for (const [key, value] of Object.entries(row)) {
      // Trim whitespace and normalize empty strings
      cleaned[key] = value?.trim() || '';
    }

    return cleaned;
  }

  /**
   * Generate processing statistics
   */
  generateStats(rows: CSVRow[], processed: number, skipped: number, errors: number) {
    return {
      totalRows: rows.length,
      processedRows: processed,
      skippedRows: skipped,
      errorRows: errors,
      successRate: processed / rows.length * 100
    };
  }
}

export default CSVProcessor;