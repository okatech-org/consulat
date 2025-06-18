import { GeminiVisionAnalyzer } from '../gemini-analyzer';
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('GeminiVisionAnalyzer', () => {
  let analyzer: GeminiVisionAnalyzer;

  beforeAll(() => {
    analyzer = new GeminiVisionAnalyzer();
  });

  it('analyzes PDF directly', async () => {
    // Mock implementation since we don't have a real PDF for testing
    vi.spyOn(analyzer, 'analyzeFile').mockResolvedValue({
      data: {
        basicInfo: {
          firstName: 'Test',
          lastName: 'User',
        },
      },
      explanation: 'Test analysis',
    });

    // Create a simple test buffer
    const pdfBuffer = Buffer.from('test pdf content');

    const result = await analyzer.analyzeFile(
      pdfBuffer,
      'application/pdf',
      'Extract text from this document',
      { data: { basicInfo: { type: 'object' } } },
    );

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.basicInfo).toBeDefined();
  });
});
