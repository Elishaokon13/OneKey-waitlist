/**
 * Document Processing Service
 * Handles OCR, validation, and data extraction for identity documents
 */

import { DocumentType, DocumentData, DocumentUpload } from './types'

// Document processing configuration
export interface DocumentProcessingConfig {
  ocrEnabled: boolean
  qualityThreshold: number
  confidenceThreshold: number
  supportedFormats: string[]
  maxFileSize: number
  imageEnhancement: boolean
}

// OCR result structure
export interface OCRResult {
  text: string
  confidence: number
  boundingBoxes: BoundingBox[]
  language: string
  processingTime: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  text: string
  confidence: number
}

// Image quality metrics
export interface ImageQuality {
  resolution: { width: number; height: number }
  dpi: number
  brightness: number
  contrast: number
  sharpness: number
  noise: number
  overall: number // 0-100 quality score
}

// Document field extraction results
export interface ExtractedFields {
  [key: string]: {
    value: string
    confidence: number
    boundingBox?: BoundingBox
  }
}

// Document validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
  securityFeatures: SecurityFeature[]
}

export interface SecurityFeature {
  type: string
  detected: boolean
  confidence: number
  description: string
}

export class DocumentProcessor {
  private config: DocumentProcessingConfig

  constructor(config?: Partial<DocumentProcessingConfig>) {
    this.config = {
      ocrEnabled: true,
      qualityThreshold: 70,
      confidenceThreshold: 80,
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      imageEnhancement: true,
      ...config,
    }
  }

  /**
   * Process a document file through the complete pipeline
   */
  async processDocument(
    file: File,
    documentType: DocumentType
  ): Promise<{
    ocr: OCRResult
    quality: ImageQuality
    extractedFields: ExtractedFields
    validation: ValidationResult
    enhancedImage?: string
  }> {
    try {
      console.log(`Starting document processing for ${documentType}:`, file.name)

      // Step 1: Validate file format and size
      this.validateFile(file)

      // Step 2: Assess image quality
      const quality = await this.assessImageQuality(file)
      console.log('Image quality assessment:', quality)

      // Step 3: Enhance image if needed
      let processedFile = file
      let enhancedImage: string | undefined
      if (this.config.imageEnhancement && quality.overall < this.config.qualityThreshold) {
        const enhancement = await this.enhanceImage(file)
        processedFile = enhancement.file
        enhancedImage = enhancement.dataUrl
        console.log('Image enhanced due to low quality')
      }

      // Step 4: Perform OCR
      const ocr = await this.performOCR(processedFile)
      console.log('OCR completed with confidence:', ocr.confidence)

      // Step 5: Extract document-specific fields
      const extractedFields = await this.extractFields(ocr, documentType)
      console.log('Field extraction completed:', Object.keys(extractedFields))

      // Step 6: Validate document authenticity
      const validation = await this.validateDocument(extractedFields, documentType, quality)
      console.log('Document validation completed:', validation.isValid)

      return {
        ocr,
        quality,
        extractedFields,
        validation,
        enhancedImage,
      }
    } catch (error) {
      console.error('Document processing failed:', error)
      throw error
    }
  }

  /**
   * Validate file format and size
   */
  private validateFile(file: File): void {
    if (!this.config.supportedFormats.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}`)
    }

    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds limit: ${file.size} bytes`)
    }

    if (file.size === 0) {
      throw new Error('File is empty')
    }
  }

  /**
   * Assess image quality metrics
   */
  private async assessImageQuality(file: File): Promise<ImageQuality> {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const pixels = imageData.data

        // Calculate quality metrics
        const brightness = this.calculateBrightness(pixels)
        const contrast = this.calculateContrast(pixels)
        const sharpness = this.calculateSharpness(pixels, img.width, img.height)
        const noise = this.calculateNoise(pixels)

        // Calculate overall quality score
        const overall = Math.round(
          (brightness * 0.2 + contrast * 0.3 + sharpness * 0.4 + (100 - noise) * 0.1)
        )

        resolve({
          resolution: { width: img.width, height: img.height },
          dpi: Math.min(img.width, img.height) > 1000 ? 300 : 150, // Estimated DPI
          brightness: Math.max(0, Math.min(100, brightness || 0)),
          contrast: Math.max(0, Math.min(100, contrast || 0)),
          sharpness: Math.max(0, Math.min(100, sharpness || 0)),
          noise: Math.max(0, Math.min(100, noise || 0)),
          overall: Math.max(0, Math.min(100, overall || 50)),
        })
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Calculate brightness score (0-100)
   */
  private calculateBrightness(pixels: Uint8ClampedArray): number {
    let sum = 0
    for (let i = 0; i < pixels.length; i += 4) {
      sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
    }
    const average = sum / (pixels.length / 4)
    
    // Optimal brightness is around 128, score based on distance from optimal
    const distance = Math.abs(average - 128)
    return Math.max(0, 100 - (distance / 128) * 100)
  }

  /**
   * Calculate contrast score (0-100)
   */
  private calculateContrast(pixels: Uint8ClampedArray): number {
    let min = 255
    let max = 0
    
    // Sample pixels to avoid memory issues with large arrays
    const sampleSize = Math.min(10000, pixels.length / 4)
    const step = Math.floor((pixels.length / 4) / sampleSize)
    
    for (let i = 0; i < pixels.length; i += step * 4) {
      const value = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
      min = Math.min(min, value)
      max = Math.max(max, value)
    }

    const contrast = max - min
    return Math.min(100, (contrast / 255) * 100)
  }

  /**
   * Calculate sharpness score (0-100)
   */
  private calculateSharpness(pixels: Uint8ClampedArray, width: number, height: number): number {
    let sum = 0
    let count = 0

    // Ensure we have valid dimensions
    if (width <= 2 || height <= 2) {
      return 50 // Default moderate sharpness for small images
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4
        
        // Bounds checking
        if (i + width * 4 >= pixels.length || i - width * 4 < 0) continue
        
        const center = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3

        // Calculate Laplacian (edge detection)
        const top = (pixels[i - width * 4] + pixels[i - width * 4 + 1] + pixels[i - width * 4 + 2]) / 3
        const bottom = (pixels[i + width * 4] + pixels[i + width * 4 + 1] + pixels[i + width * 4 + 2]) / 3
        const left = (pixels[i - 4] + pixels[i - 3] + pixels[i - 2]) / 3
        const right = (pixels[i + 4] + pixels[i + 5] + pixels[i + 6]) / 3

        const laplacian = Math.abs(4 * center - top - bottom - left - right)
        sum += laplacian
        count++
      }
    }

    const average = count > 0 ? sum / count : 0
    return Math.min(100, Math.max(0, (average / 50) * 100)) // Normalize to 0-100
  }

  /**
   * Calculate noise score (0-100, lower is better)
   */
  private calculateNoise(pixels: Uint8ClampedArray): number {
    let variance = 0
    let mean = 0
    const sampleSize = Math.min(10000, pixels.length / 4)

    // Calculate mean
    for (let i = 0; i < sampleSize * 4; i += 4) {
      mean += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
    }
    mean /= sampleSize

    // Calculate variance
    for (let i = 0; i < sampleSize * 4; i += 4) {
      const value = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
      variance += Math.pow(value - mean, 2)
    }
    variance /= sampleSize

    // Convert variance to noise score (0-100)
    return Math.min(100, Math.sqrt(variance) / 10)
  }

  /**
   * Enhance image quality
   */
  private async enhanceImage(file: File): Promise<{ file: File; dataUrl: string }> {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Apply enhancement filters
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const enhanced = this.applyEnhancements(imageData)
        ctx.putImageData(enhanced, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const enhancedFile = new File([blob], file.name, { type: file.type })
            resolve({
              file: enhancedFile,
              dataUrl: canvas.toDataURL(),
            })
          }
        }, file.type)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Apply image enhancement algorithms
   */
  private applyEnhancements(imageData: ImageData): ImageData {
    const data = imageData.data
    const enhanced = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height)

    // Apply contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast
      enhanced.data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128))
      enhanced.data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128))
      enhanced.data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128))
      enhanced.data[i + 3] = data[i + 3] // Alpha channel
    }

    return enhanced
  }

  /**
   * Perform OCR on the document
   */
  private async performOCR(file: File): Promise<OCRResult> {
    // Simulate OCR processing with realistic results
    const startTime = Date.now()
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const processingTime = Date.now() - startTime
    const confidence = 75 + Math.random() * 20 // 75-95% confidence

    // Generate realistic OCR text based on file name or type
    const mockText = this.generateMockOCRText(file.name)
    const boundingBoxes = this.generateMockBoundingBoxes(mockText)

    return {
      text: mockText,
      confidence: Math.round(confidence),
      boundingBoxes,
      language: 'en',
      processingTime,
    }
  }

  /**
   * Generate mock OCR text based on document type
   */
  private generateMockOCRText(fileName: string): string {
    const lowerName = fileName.toLowerCase()

    if (lowerName.includes('passport')) {
      return `PASSPORT
United States of America
Type: P
Country Code: USA
Passport No.: 123456789
Surname: SMITH
Given Names: JOHN MICHAEL
Nationality: USA
Date of Birth: 15 JAN 1985
Sex: M
Place of Birth: NEW YORK, USA
Date of Issue: 20 MAR 2020
Date of Expiry: 19 MAR 2030
Authority: U.S. DEPARTMENT OF STATE`
    }

    if (lowerName.includes('license') || lowerName.includes('driver')) {
      return `DRIVER LICENSE
State of California
DL 12345678
SMITH, JOHN MICHAEL
123 MAIN STREET
ANYTOWN, CA 90210
DOB: 01/15/1985
SEX: M
HAIR: BRN
EYES: BLU
HGT: 5-10
WGT: 175
CLASS: C
ISSUED: 03/20/2020
EXPIRES: 01/15/2025`
    }

    if (lowerName.includes('utility') || lowerName.includes('bill')) {
      return `ELECTRIC COMPANY
Monthly Statement
Account Number: 1234567890
Service Address:
123 MAIN STREET
ANYTOWN, CA 90210
Statement Date: March 15, 2024
Due Date: April 10, 2024
Amount Due: $125.67
Customer: JOHN M SMITH`
    }

    // Default generic document text
    return `OFFICIAL DOCUMENT
Document Number: DOC123456789
Issued To: JOHN MICHAEL SMITH
Address: 123 MAIN STREET
ANYTOWN, CA 90210
Date of Issue: March 20, 2024
Valid Until: March 20, 2025
Authorized Signature: [Signature]`
  }

  /**
   * Generate mock bounding boxes for OCR text
   */
  private generateMockBoundingBoxes(text: string): BoundingBox[] {
    const lines = text.split('\n').filter(line => line.trim())
    const boxes: BoundingBox[] = []

    lines.forEach((line, index) => {
      const words = line.split(' ').filter(word => word.trim())
      let x = 50 + Math.random() * 20

      words.forEach((word) => {
        const width = word.length * 8 + Math.random() * 10
        boxes.push({
          x: Math.round(x),
          y: Math.round(50 + index * 25 + Math.random() * 5),
          width: Math.round(width),
          height: Math.round(18 + Math.random() * 4),
          text: word,
          confidence: Math.round(80 + Math.random() * 15),
        })
        x += width + 5 + Math.random() * 5
      })
    })

    return boxes
  }

  /**
   * Extract structured fields from OCR text
   */
  private async extractFields(ocr: OCRResult, documentType: DocumentType): Promise<ExtractedFields> {
    const fields: ExtractedFields = {}
    const text = ocr.text.toUpperCase()

    switch (documentType) {
      case 'passport':
        fields.documentNumber = this.extractField(text, /PASSPORT NO[.:]?\s*([A-Z0-9]+)/, ocr.boundingBoxes)
        fields.surname = this.extractField(text, /SURNAME[:]?\s*([A-Z\s]+)/, ocr.boundingBoxes)
        fields.givenNames = this.extractField(text, /GIVEN NAMES[:]?\s*([A-Z\s]+)/, ocr.boundingBoxes)
        fields.dateOfBirth = this.extractField(text, /DATE OF BIRTH[:]?\s*(\d{1,2}\s+[A-Z]{3}\s+\d{4})/, ocr.boundingBoxes)
        fields.nationality = this.extractField(text, /NATIONALITY[:]?\s*([A-Z]{3})/, ocr.boundingBoxes)
        fields.expiryDate = this.extractField(text, /DATE OF EXPIRY[:]?\s*(\d{1,2}\s+[A-Z]{3}\s+\d{4})/, ocr.boundingBoxes)
        break

      case 'drivers_license':
        fields.licenseNumber = this.extractField(text, /DL\s+([A-Z0-9]+)/, ocr.boundingBoxes)
        fields.fullName = this.extractField(text, /([A-Z]+,\s*[A-Z\s]+)/, ocr.boundingBoxes)
        fields.address = this.extractField(text, /(\d+\s+[A-Z\s]+STREET[^A-Z]*[A-Z]{2}\s+\d{5})/, ocr.boundingBoxes)
        fields.dateOfBirth = this.extractField(text, /DOB[:]?\s*(\d{2}\/\d{2}\/\d{4})/, ocr.boundingBoxes)
        fields.expiryDate = this.extractField(text, /EXPIRES[:]?\s*(\d{2}\/\d{2}\/\d{4})/, ocr.boundingBoxes)
        break

      case 'utility_bill':
        fields.accountNumber = this.extractField(text, /ACCOUNT NUMBER[:]?\s*([0-9]+)/, ocr.boundingBoxes)
        fields.customerName = this.extractField(text, /CUSTOMER[:]?\s*([A-Z\s]+)/, ocr.boundingBoxes)
        fields.serviceAddress = this.extractField(text, /SERVICE ADDRESS[:]?\s*([A-Z0-9\s,]+)/, ocr.boundingBoxes)
        fields.statementDate = this.extractField(text, /STATEMENT DATE[:]?\s*([A-Z]+\s+\d{1,2},\s+\d{4})/, ocr.boundingBoxes)
        fields.amountDue = this.extractField(text, /AMOUNT DUE[:]?\s*\$([0-9,.]+)/, ocr.boundingBoxes)
        break

      default:
        // Generic field extraction
        fields.documentNumber = this.extractField(text, /(?:DOCUMENT|DOC|NUMBER|NO)[:]?\s*([A-Z0-9]+)/, ocr.boundingBoxes)
        fields.name = this.extractField(text, /(?:NAME|ISSUED TO)[:]?\s*([A-Z\s]+)/, ocr.boundingBoxes)
        fields.date = this.extractField(text, /(?:DATE|ISSUED)[:]?\s*([A-Z]+\s+\d{1,2},\s+\d{4})/, ocr.boundingBoxes)
    }

    return fields
  }

  /**
   * Extract a specific field using regex pattern
   */
  private extractField(text: string, pattern: RegExp, boundingBoxes: BoundingBox[]): {
    value: string
    confidence: number
    boundingBox?: BoundingBox
  } {
    const match = text.match(pattern)
    if (!match || !match[1]) {
      return { value: '', confidence: 0 }
    }

    const value = match[1].trim()
    
    // Find corresponding bounding box
    const boundingBox = boundingBoxes.find(box => 
      box.text.toUpperCase().includes(value) || value.includes(box.text.toUpperCase())
    )

    return {
      value,
      confidence: boundingBox?.confidence || 85,
      boundingBox,
    }
  }

  /**
   * Validate document authenticity and completeness
   */
  private async validateDocument(
    fields: ExtractedFields,
    documentType: DocumentType,
    quality: ImageQuality
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const securityFeatures: SecurityFeature[] = []

    // Check image quality
    if (quality.overall < 60) {
      errors.push('Image quality too low for reliable processing')
    } else if (quality.overall < 80) {
      warnings.push('Image quality could be improved')
    }

    // Validate required fields based on document type
    const requiredFields = this.getRequiredFields(documentType)
    for (const field of requiredFields) {
      if (!fields[field] || !fields[field].value) {
        errors.push(`Missing required field: ${field}`)
      } else if (fields[field].confidence < 70) {
        warnings.push(`Low confidence for field: ${field} (${fields[field].confidence}%)`)
      }
    }

    // Simulate security feature detection
    securityFeatures.push(
      {
        type: 'watermark',
        detected: Math.random() > 0.3,
        confidence: Math.round(70 + Math.random() * 25),
        description: 'Document watermark or background pattern',
      },
      {
        type: 'microtext',
        detected: Math.random() > 0.4,
        confidence: Math.round(65 + Math.random() * 30),
        description: 'Microtext security features',
      },
      {
        type: 'hologram',
        detected: documentType === 'passport' && Math.random() > 0.2,
        confidence: Math.round(75 + Math.random() * 20),
        description: 'Holographic security elements',
      }
    )

    // Calculate overall confidence
    const fieldConfidences = Object.values(fields)
      .filter(field => field.value)
      .map(field => field.confidence)
    
    const avgFieldConfidence = fieldConfidences.length > 0 
      ? fieldConfidences.reduce((sum, conf) => sum + conf, 0) / fieldConfidences.length 
      : 0

    const securityScore = securityFeatures
      .filter(feature => feature.detected)
      .reduce((sum, feature) => sum + feature.confidence, 0) / securityFeatures.length || 0

    const overallConfidence = Math.round(
      (avgFieldConfidence * 0.6 + quality.overall * 0.2 + securityScore * 0.2)
    )

    return {
      isValid: errors.length === 0 && overallConfidence >= this.config.confidenceThreshold,
      errors,
      warnings,
      confidence: overallConfidence,
      securityFeatures,
    }
  }

  /**
   * Get required fields for document type
   */
  private getRequiredFields(documentType: DocumentType): string[] {
    switch (documentType) {
      case 'passport':
        return ['documentNumber', 'surname', 'givenNames', 'dateOfBirth', 'nationality', 'expiryDate']
      case 'drivers_license':
        return ['licenseNumber', 'fullName', 'dateOfBirth', 'expiryDate']
      case 'utility_bill':
        return ['customerName', 'serviceAddress', 'statementDate']
      case 'national_id':
        return ['documentNumber', 'fullName', 'dateOfBirth']
      default:
        return ['documentNumber', 'name']
    }
  }

  /**
   * Get processing configuration
   */
  getConfig(): DocumentProcessingConfig {
    return { ...this.config }
  }

  /**
   * Update processing configuration
   */
  updateConfig(updates: Partial<DocumentProcessingConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor() 