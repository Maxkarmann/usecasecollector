/**
 * CSV Import Script for Use Case Library
 * 
 * This script reads Use_Case_Library.csv from the backend root directory
 * and imports valid use cases into the database.
 * 
 * Features:
 * - Skips rows with empty "Use Case" or "Concept description" fields
 * - Idempotent: checks for existing use cases before inserting
 * - Provides detailed logging and summary statistics
 * 
 * Usage: npm run import
 */

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// =============================================================================
// INTERFACES
// =============================================================================

interface CsvRow {
  'Use Case'?: string;
  'Concept description'?: string;
  'Concrete implementation'?: string;
  'Benefit'?: string;
  'Industry'?: string;
  'Department'?: string;
  'Value Chain Step'?: string;
  'URL'?: string;
  [key: string]: string | undefined;
}

interface ImportStats {
  totalRows: number;
  inserted: number;
  skipped: number;
  duplicates: number;
  errors: number;
  errorDetails: Array<{ row: number; reason: string }>;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Normalizes a string value from CSV
 * Returns null if the value is empty or only whitespace
 */
function normalizeValue(value: string | undefined | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlRegex.test(url);
}

/**
 * Formats duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// =============================================================================
// MAIN IMPORT LOGIC
// =============================================================================

async function importUseCases(): Promise<void> {
  const startTime = Date.now();
  const csvFilePath = path.join(__dirname, '..', 'Use_Case_Library.csv');

  console.log('='.repeat(70));
  console.log('📊 USE CASE LIBRARY IMPORT SCRIPT');
  console.log('='.repeat(70));
  console.log(`📁 CSV File: ${csvFilePath}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`\n❌ ERROR: CSV file not found at: ${csvFilePath}`);
    console.error('Please ensure Use_Case_Library.csv is in the backend root directory.');
    process.exit(1);
  }

  // Initialize statistics
  const stats: ImportStats = {
    totalRows: 0,
    inserted: 0,
    skipped: 0,
    duplicates: 0,
    errors: 0,
    errorDetails: [],
  };

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established\n');

    // Read and parse CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Configure parser with robust options
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle BOM characters
      relax_column_count: true, // Handle inconsistent column counts
      skip_records_with_error: true,
    });

    const records: CsvRow[] = [];
    for await (const record of parser) {
      records.push(record as CsvRow);
    }

    stats.totalRows = records.length;
    console.log(`📝 Found ${stats.totalRows} rows in CSV file\n`);

    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // Account for header row and 0-indexing

      if (row === undefined) {
        continue;
      }

      try {
        // Extract and normalize values
        const useCase = normalizeValue(row['Use Case']);
        const conceptDescription = normalizeValue(row['Concept description']);

        // Skip rows with empty required fields
        if (!useCase) {
          stats.skipped++;
          stats.errorDetails.push({
            row: rowNumber,
            reason: 'Empty "Use Case" field',
          });
          console.log(`⏭️  Row ${rowNumber}: Skipped - Empty "Use Case" field`);
          continue;
        }

        if (!conceptDescription) {
          stats.skipped++;
          stats.errorDetails.push({
            row: rowNumber,
            reason: 'Empty "Concept description" field',
          });
          console.log(`⏭️  Row ${rowNumber}: Skipped - Empty "Concept description" field`);
          continue;
        }

        // Check for existing use case (idempotency)
        const existing = await prisma.useCase.findFirst({
          where: {
            useCase: {
              equals: useCase,
              mode: 'insensitive',
            },
          },
        });

        if (existing) {
          stats.duplicates++;
          console.log(`🔄 Row ${rowNumber}: Duplicate - "${useCase.substring(0, 50)}..."`);
          continue;
        }

        // Validate and extract optional fields
        const url = normalizeValue(row['URL']);
        if (url && !isValidUrl(url)) {
          console.warn(`⚠️  Row ${rowNumber}: Invalid URL format, storing as-is: ${url}`);
        }

        // Insert new use case
        await prisma.useCase.create({
          data: {
            useCase,
            conceptDescription,
            concreteImplementation: normalizeValue(row['Concrete implementation']),
            benefit: normalizeValue(row['Benefit']),
            industry: normalizeValue(row['Industry']),
            department: normalizeValue(row['Department']),
            valueChainStep: normalizeValue(row['Value Chain Step']),
            url,
          },
        });

        stats.inserted++;
        console.log(`✅ Row ${rowNumber}: Inserted - "${useCase.substring(0, 50)}..."`);

      } catch (error) {
        stats.errors++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        stats.errorDetails.push({
          row: rowNumber,
          reason: errorMessage,
        });
        console.error(`❌ Row ${rowNumber}: Error - ${errorMessage}`);
      }
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR during import:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  // Print summary
  const duration = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`📝 Total Rows Processed: ${stats.totalRows}`);
  console.log(`✅ Successfully Inserted: ${stats.inserted}`);
  console.log(`⏭️  Skipped (Empty Fields): ${stats.skipped}`);
  console.log(`🔄 Skipped (Duplicates): ${stats.duplicates}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log(`⏱️  Duration: ${formatDuration(duration)}`);
  console.log('='.repeat(70));

  // Print error details if any
  if (stats.errorDetails.length > 0 && stats.errorDetails.length <= 20) {
    console.log('\n📋 SKIPPED/ERROR DETAILS:');
    console.log('-'.repeat(70));
    stats.errorDetails.forEach(({ row, reason }) => {
      console.log(`  Row ${row}: ${reason}`);
    });
  } else if (stats.errorDetails.length > 20) {
    console.log(`\n📋 ${stats.errorDetails.length} rows were skipped or had errors.`);
    console.log('   (Showing first 20 only)');
    console.log('-'.repeat(70));
    stats.errorDetails.slice(0, 20).forEach(({ row, reason }) => {
      console.log(`  Row ${row}: ${reason}`);
    });
  }

  // Final status
  if (stats.errors > 0) {
    console.log('\n⚠️  Import completed with errors. Please review the details above.');
    process.exit(1);
  } else {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  }
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

importUseCases().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

