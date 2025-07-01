/**
 * Document Processor Tests
 * Comprehensive test suite for document processing, OCR, and validation
 */

// Mock DOM APIs for testing environment
global.Image = class {
  onload: (() => void) | null = null
  src: string = ''
  width: number = 800
  height: number = 600
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 10)
  }
} as any

global.ImageData = class {
  data: Uint8ClampedArray
  width: number
  height: number
  
  constructor(data: Uint8ClampedArray, width: number, height?: number) {
    this.data = data
    this.width = width
    this.height = height || data.length / (width * 4)
  }
} as any

global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(800 * 600 * 4).fill(128), // Gray image
    width: 800,
    height: 600,
  })),
  putImageData: jest.fn(),
})) as any

global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  const blob = new Blob(['mock-image-data'], { type: 'image/jpeg' })
  callback(blob)
}) as any

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,mock-data') as any

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url') as any

import { DocumentProcessor, documentProcessor } from '@/lib/verification/document-processor'
import { DocumentType } from '@/lib/verification/types'

describe('DocumentProcessor', () => {
  let processor: DocumentProcessor

  beforeEach(() => {
    processor = new DocumentProcessor()
    jest.clearAllMocks()
  })

  describe('Configuration Management', () => {
    it('should initialize with default configuration', () => {
      const config = processor.getConfig()
      
      expect(config.ocrEnabled).toBe(true)
      expect(config.qualityThreshold).toBe(70)
      expect(config.confidenceThreshold).toBe(80)
      expect(config.maxFileSize).toBe(10 * 1024 * 1024)
      expect(config.imageEnhancement).toBe(true)
      expect(config.supportedFormats).toContain('image/jpeg')
      expect(config.supportedFormats).toContain('image/png')
    })

    it('should allow configuration updates', () => {
      processor.updateConfig({
        qualityThreshold: 85,
        confidenceThreshold: 90,
      })

      const config = processor.getConfig()
      expect(config.qualityThreshold).toBe(85)
      expect(config.confidenceThreshold).toBe(90)
      expect(config.ocrEnabled).toBe(true) // Should preserve other settings
    })

    it('should create processor with custom configuration', () => {
      const customProcessor = new DocumentProcessor({
        ocrEnabled: false,
        qualityThreshold: 60,
        imageEnhancement: false,
      })

      const config = customProcessor.getConfig()
      expect(config.ocrEnabled).toBe(false)
      expect(config.qualityThreshold).toBe(60)
      expect(config.imageEnhancement).toBe(false)
    })
  })

  describe('File Validation', () => {
    it('should accept valid image files', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      // Should not throw
      await expect(processor.processDocument(file, 'passport')).resolves.toBeDefined()
    })

    it('should reject unsupported file formats', async () => {
      const file = new File(['test'], 'document.txt', { type: 'text/plain' })
      
      await expect(processor.processDocument(file, 'passport'))
        .rejects.toThrow('Unsupported file format: text/plain')
    })

    it('should reject files that are too large', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      
      await expect(processor.processDocument(file, 'passport'))
        .rejects.toThrow('File size exceeds limit')
    })

    it('should reject empty files', async () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' })
      
      await expect(processor.processDocument(file, 'passport'))
        .rejects.toThrow('File is empty')
    })
  })

  describe('Image Quality Assessment', () => {
    it('should assess image quality metrics', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.quality).toBeDefined()
      expect(result.quality.resolution).toEqual({ width: 800, height: 600 })
      expect(result.quality.brightness).toBeGreaterThanOrEqual(0)
      expect(result.quality.brightness).toBeLessThanOrEqual(100)
      expect(result.quality.contrast).toBeGreaterThanOrEqual(0)
      expect(result.quality.contrast).toBeLessThanOrEqual(100)
      expect(result.quality.sharpness).toBeGreaterThanOrEqual(0)
      expect(result.quality.sharpness).toBeLessThanOrEqual(100)
      expect(result.quality.noise).toBeGreaterThanOrEqual(0)
      expect(result.quality.noise).toBeLessThanOrEqual(100)
      expect(result.quality.overall).toBeGreaterThanOrEqual(0)
      expect(result.quality.overall).toBeLessThanOrEqual(100)
    })

    it('should estimate DPI based on resolution', async () => {
      const file = new File(['test'], 'high-res.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.quality.dpi).toBeGreaterThan(0)
      expect([150, 300]).toContain(result.quality.dpi)
    })
  })

  describe('OCR Processing', () => {
    it('should perform OCR and return structured results', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.ocr).toBeDefined()
      expect(result.ocr.text).toContain('PASSPORT')
      expect(result.ocr.confidence).toBeGreaterThanOrEqual(75)
      expect(result.ocr.confidence).toBeLessThanOrEqual(95)
      expect(result.ocr.boundingBoxes).toBeInstanceOf(Array)
      expect(result.ocr.language).toBe('en')
      expect(result.ocr.processingTime).toBeGreaterThan(0)
    })

    it('should generate document-specific OCR text for passport', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.ocr.text).toContain('PASSPORT')
      expect(result.ocr.text).toContain('United States of America')
      expect(result.ocr.text).toContain('Passport No.')
      expect(result.ocr.text).toContain('SMITH')
    })

    it('should generate document-specific OCR text for drivers license', async () => {
      const file = new File(['test'], 'drivers_license.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'drivers_license')
      
      expect(result.ocr.text).toContain('DRIVER LICENSE')
      expect(result.ocr.text).toContain('California')
      expect(result.ocr.text).toContain('DL')
      expect(result.ocr.text).toContain('DOB')
    })

    it('should generate document-specific OCR text for utility bill', async () => {
      const file = new File(['test'], 'utility_bill.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'utility_bill')
      
      expect(result.ocr.text).toContain('ELECTRIC COMPANY')
      expect(result.ocr.text).toContain('Account Number')
      expect(result.ocr.text).toContain('Statement Date')
      expect(result.ocr.text).toContain('Amount Due')
    })

    it('should generate bounding boxes for OCR text', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.ocr.boundingBoxes.length).toBeGreaterThan(0)
      
      const firstBox = result.ocr.boundingBoxes[0]
      expect(firstBox.x).toBeGreaterThanOrEqual(0)
      expect(firstBox.y).toBeGreaterThanOrEqual(0)
      expect(firstBox.width).toBeGreaterThan(0)
      expect(firstBox.height).toBeGreaterThan(0)
      expect(firstBox.text).toBeDefined()
      expect(firstBox.confidence).toBeGreaterThanOrEqual(80)
      expect(firstBox.confidence).toBeLessThanOrEqual(95)
    })
  })

  describe('Field Extraction', () => {
    it('should extract passport fields correctly', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.extractedFields.documentNumber).toBeDefined()
      expect(result.extractedFields.documentNumber.value).toBe('123456789')
      expect(result.extractedFields.surname).toBeDefined()
      expect(result.extractedFields.surname.value).toBe('SMITH')
      expect(result.extractedFields.givenNames).toBeDefined()
      expect(result.extractedFields.givenNames.value).toBe('JOHN MICHAEL')
      expect(result.extractedFields.dateOfBirth).toBeDefined()
      expect(result.extractedFields.nationality).toBeDefined()
      expect(result.extractedFields.expiryDate).toBeDefined()
    })

    it('should extract drivers license fields correctly', async () => {
      const file = new File(['test'], 'license.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'drivers_license')
      
      expect(result.extractedFields.licenseNumber).toBeDefined()
      expect(result.extractedFields.licenseNumber.value).toBe('12345678')
      expect(result.extractedFields.fullName).toBeDefined()
      expect(result.extractedFields.fullName.value).toBe('SMITH, JOHN MICHAEL')
      expect(result.extractedFields.dateOfBirth).toBeDefined()
      expect(result.extractedFields.expiryDate).toBeDefined()
      expect(result.extractedFields.address).toBeDefined()
    })

    it('should extract utility bill fields correctly', async () => {
      const file = new File(['test'], 'utility.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'utility_bill')
      
      expect(result.extractedFields.accountNumber).toBeDefined()
      expect(result.extractedFields.accountNumber.value).toBe('1234567890')
      expect(result.extractedFields.customerName).toBeDefined()
      expect(result.extractedFields.customerName.value).toBe('JOHN M SMITH')
      expect(result.extractedFields.serviceAddress).toBeDefined()
      expect(result.extractedFields.statementDate).toBeDefined()
      expect(result.extractedFields.amountDue).toBeDefined()
    })

    it('should include confidence scores for extracted fields', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      Object.values(result.extractedFields).forEach(field => {
        if (field.value) {
          expect(field.confidence).toBeGreaterThanOrEqual(80)
          expect(field.confidence).toBeLessThanOrEqual(95)
        }
      })
    })

    it('should handle missing fields gracefully', async () => {
      const file = new File(['test'], 'unknown.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      // Should not throw and should have some fields
      expect(result.extractedFields).toBeDefined()
      expect(typeof result.extractedFields).toBe('object')
    })
  })

  describe('Document Validation', () => {
    it('should validate document authenticity', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.validation).toBeDefined()
      expect(typeof result.validation.isValid).toBe('boolean')
      expect(result.validation.confidence).toBeGreaterThanOrEqual(0)
      expect(result.validation.confidence).toBeLessThanOrEqual(100)
      expect(Array.isArray(result.validation.errors)).toBe(true)
      expect(Array.isArray(result.validation.warnings)).toBe(true)
      expect(Array.isArray(result.validation.securityFeatures)).toBe(true)
    })

    it('should detect security features', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.validation.securityFeatures.length).toBeGreaterThan(0)
      
      const watermarkFeature = result.validation.securityFeatures.find(f => f.type === 'watermark')
      expect(watermarkFeature).toBeDefined()
      expect(typeof watermarkFeature!.detected).toBe('boolean')
      expect(watermarkFeature!.confidence).toBeGreaterThanOrEqual(0)
      expect(watermarkFeature!.description).toBeDefined()
    })

    it('should validate required fields based on document type', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      // Should validate that passport has required fields
      const hasRequiredFields = result.extractedFields.documentNumber?.value &&
                               result.extractedFields.surname?.value &&
                               result.extractedFields.givenNames?.value
      
      if (!hasRequiredFields) {
        expect(result.validation.errors.some(error => 
          error.includes('Missing required field')
        )).toBe(true)
      }
    })

    it('should flag low quality images', async () => {
      // Mock low quality image
      const mockGetImageData = jest.fn(() => ({
        data: new Uint8ClampedArray(100 * 100 * 4).fill(50), // Very dark image
        width: 100,
        height: 100,
      }))
      
      global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
        getImageData: mockGetImageData,
        putImageData: jest.fn(),
      })) as any

      const file = new File(['test'], 'low-quality.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      if (result.quality.overall < 60) {
        expect(result.validation.errors.some(error => 
          error.includes('Image quality too low')
        )).toBe(true)
      }
    })
  })

  describe('Image Enhancement', () => {
    it('should enhance low quality images when enabled', async () => {
      // Mock low quality image that triggers enhancement
      const mockGetImageData = jest.fn(() => ({
        data: new Uint8ClampedArray(200 * 200 * 4).fill(60), // Low quality image
        width: 200,
        height: 200,
      }))
      
      global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
        getImageData: mockGetImageData,
        putImageData: jest.fn(),
      })) as any

      processor.updateConfig({ imageEnhancement: true, qualityThreshold: 80 })
      
      const file = new File(['test'], 'low-quality.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      // Should have enhanced image data URL if enhancement was triggered
      if (result.quality.overall < 80) {
        expect(result.enhancedImage).toBeDefined()
        expect(result.enhancedImage).toContain('data:image/jpeg;base64,')
      }
    })

    it('should skip enhancement when disabled', async () => {
      processor.updateConfig({ imageEnhancement: false })
      
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.enhancedImage).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock an error in image processing
      global.Image = class {
        onload: (() => void) | null = null
        onerror: ((error: any) => void) | null = null
        src: string = ''
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('Image load failed'))
          }, 10)
        }
      } as any

      const file = new File(['test'], 'corrupted.jpg', { type: 'image/jpeg' })
      
      await expect(processor.processDocument(file, 'passport')).rejects.toThrow()
    })

    it('should validate configuration constraints', () => {
      expect(() => {
        processor.updateConfig({ qualityThreshold: -10 })
      }).not.toThrow() // Should accept any number, validation happens during processing
      
      expect(() => {
        processor.updateConfig({ confidenceThreshold: 150 })
      }).not.toThrow() // Should accept any number, validation happens during processing
    })
  })

  describe('Performance', () => {
    it('should complete processing within reasonable time', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const startTime = Date.now()
      await processor.processDocument(file, 'passport')
      const endTime = Date.now()
      
      const processingTime = endTime - startTime
      expect(processingTime).toBeLessThan(5000) // Should complete within 5 seconds
    }, 10000)

    it('should report OCR processing time', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const result = await processor.processDocument(file, 'passport')
      
      expect(result.ocr.processingTime).toBeGreaterThan(0)
      expect(result.ocr.processingTime).toBeLessThan(5000)
    })
  })

  describe('Singleton Instance', () => {
    it('should provide a singleton instance', () => {
      expect(documentProcessor).toBeInstanceOf(DocumentProcessor)
      expect(documentProcessor.getConfig()).toBeDefined()
    })

    it('should maintain configuration across calls', () => {
      documentProcessor.updateConfig({ qualityThreshold: 95 })
      
      const config = documentProcessor.getConfig()
      expect(config.qualityThreshold).toBe(95)
    })
  })
}) 