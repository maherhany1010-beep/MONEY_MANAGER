import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Export data to Excel (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // Generate Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw new Error('فشل تصدير البيانات إلى Excel')
  }
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
): void {
  try {
    // Convert data to CSV
    const csv = Papa.unparse(data, {
      quotes: true,
      delimiter: ',',
      header: true,
    })
    
    // Create blob
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    
    // Download file
    downloadBlob(blob, `${filename}.csv`)
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    throw new Error('فشل تصدير البيانات إلى CSV')
  }
}

/**
 * Export data to PDF
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options: {
    title?: string
    columns?: Array<{ header: string; dataKey: keyof T }>
    orientation?: 'portrait' | 'landscape'
  } = {}
): void {
  try {
    const {
      title = 'تقرير',
      columns,
      orientation = 'portrait',
    } = options

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    })

    // Add Arabic font support (using default font for now)
    doc.setFont('helvetica')
    doc.setFontSize(16)

    // Add title
    if (title) {
      doc.text(title, 14, 15)
    }

    // Prepare table data
    let tableColumns: string[]
    let tableData: any[][]

    if (columns) {
      tableColumns = columns.map(col => col.header)
      tableData = data.map(row =>
        columns.map(col => String(row[col.dataKey] ?? ''))
      )
    } else {
      // Auto-generate columns from first data item
      if (data.length > 0) {
        tableColumns = Object.keys(data[0])
        tableData = data.map(row => Object.values(row).map(v => String(v ?? '')))
      } else {
        tableColumns = []
        tableData = []
      }
    }

    // Add table
    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      startY: title ? 25 : 15,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    // Save PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('فشل تصدير البيانات إلى PDF')
  }
}

/**
 * Import data from Excel
 */
export async function importFromExcel<T = any>(
  file: File
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json<T>(worksheet)
          
          resolve(jsonData)
        } catch (error) {
          reject(new Error('فشل قراءة ملف Excel'))
        }
      }

      reader.onerror = () => {
        reject(new Error('فشل قراءة الملف'))
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      reject(new Error('فشل استيراد البيانات من Excel'))
    }
  })
}

/**
 * Import data from CSV
 */
export async function importFromCSV<T = any>(
  file: File
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error('فشل قراءة ملف CSV'))
        } else {
          resolve(results.data)
        }
      },
      error: (error) => {
        reject(new Error('فشل استيراد البيانات من CSV'))
      },
    })
  })
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export multiple sheets to Excel
 */
export function exportMultipleToExcel(
  sheets: Array<{
    name: string
    data: Record<string, any>[]
  }>,
  filename: string
): void {
  try {
    const wb = XLSX.utils.book_new()

    sheets.forEach(({ name, data }) => {
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, name)
    })

    XLSX.writeFile(wb, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting multiple sheets:', error)
    throw new Error('فشل تصدير البيانات')
  }
}

/**
 * Export data to JSON
 */
export function exportToJSON<T>(
  data: T,
  filename: string
): void {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, `${filename}.json`)
  } catch (error) {
    console.error('Error exporting to JSON:', error)
    throw new Error('فشل تصدير البيانات إلى JSON')
  }
}

/**
 * Import data from JSON
 */
export async function importFromJSON<T = any>(
  file: File
): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)
        resolve(data)
      } catch (error) {
        reject(new Error('فشل قراءة ملف JSON'))
      }
    }

    reader.onerror = () => {
      reject(new Error('فشل قراءة الملف'))
    }

    reader.readAsText(file)
  })
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

