'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
} from 'lucide-react'
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportToJSON,
  importFromExcel,
  importFromCSV,
  importFromJSON,
  validateFileType,
  formatFileSize,
} from '@/lib/export'
import { toast } from '@/lib/toast'

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json'

interface ExportDialogProps {
  data: any[]
  filename: string
  title?: string
  columns?: Array<{ header: string; dataKey: string }>
  trigger?: React.ReactNode
}

export function ExportDialog({
  data,
  filename,
  title,
  columns,
  trigger,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير')
      return
    }

    setLoading(true)

    try {
      switch (format) {
        case 'excel':
          exportToExcel(data, filename)
          toast.success('تم تصدير البيانات إلى Excel بنجاح')
          break
        case 'csv':
          exportToCSV(data, filename)
          toast.success('تم تصدير البيانات إلى CSV بنجاح')
          break
        case 'pdf':
          exportToPDF(data, filename, { title, columns })
          toast.success('تم تصدير البيانات إلى PDF بنجاح')
          break
        case 'json':
          exportToJSON(data, filename)
          toast.success('تم تصدير البيانات إلى JSON بنجاح')
          break
      }

      setOpen(false)
    } catch (error) {
      toast.error('فشل تصدير البيانات')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        )}
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تصدير البيانات</DialogTitle>
          <DialogDescription>
            اختر صيغة التصدير المناسبة ({data.length} عنصر)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Excel (.xlsx)</div>
                  <div className="text-xs text-muted-foreground">
                    مناسب للتحليل والتعديل في Excel
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">CSV (.csv)</div>
                  <div className="text-xs text-muted-foreground">
                    ملف نصي بسيط متوافق مع جميع البرامج
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileText className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium">PDF (.pdf)</div>
                  <div className="text-xs text-muted-foreground">
                    مناسب للطباعة والمشاركة
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileJson className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium">JSON (.json)</div>
                  <div className="text-xs text-muted-foreground">
                    مناسب للنسخ الاحتياطي والاستيراد
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ImportDialogProps {
  onImport: (data: any[]) => void
  acceptedFormats?: ExportFormat[]
  trigger?: React.ReactNode
  title?: string
  description?: string
}

export function ImportDialog({
  onImport,
  acceptedFormats = ['excel', 'csv', 'json'],
  trigger,
  title = 'استيراد البيانات',
  description = 'اختر ملف لاستيراد البيانات',
}: ImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedExtensions = acceptedFormats.map(f => {
        switch (f) {
          case 'excel': return 'xlsx'
          case 'csv': return 'csv'
          case 'json': return 'json'
          default: return f
        }
      })

      if (validateFileType(file, allowedExtensions)) {
        setSelectedFile(file)
      } else {
        toast.error('صيغة الملف غير مدعومة')
        e.target.value = ''
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('الرجاء اختيار ملف')
      return
    }

    setLoading(true)

    try {
      let data: any[]
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()

      switch (extension) {
        case 'xlsx':
          data = await importFromExcel(selectedFile)
          break
        case 'csv':
          data = await importFromCSV(selectedFile)
          break
        case 'json':
          const jsonData = await importFromJSON(selectedFile)
          data = Array.isArray(jsonData) ? jsonData : [jsonData]
          break
        default:
          throw new Error('صيغة الملف غير مدعومة')
      }

      onImport(data)
      toast.success(`تم استيراد ${data.length} عنصر بنجاح`)
      setOpen(false)
      setSelectedFile(null)
    } catch (error) {
      toast.error('فشل استيراد البيانات')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const acceptString = acceptedFormats
    .map(f => {
      switch (f) {
        case 'excel': return '.xlsx'
        case 'csv': return '.csv'
        case 'json': return '.json'
        default: return `.${f}`
      }
    })
    .join(',')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept={acceptString}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-sm font-medium">
                اضغط لاختيار ملف
              </div>
              <div className="text-xs text-muted-foreground">
                {acceptedFormats.map(f => f.toUpperCase()).join(', ')}
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{selectedFile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  إزالة
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile || loading}>
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              <Upload className="h-4 w-4 ml-2" />
              استيراد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

