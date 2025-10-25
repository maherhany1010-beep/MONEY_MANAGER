'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ExportData {
  totalBalance: number
  totalAccounts: number
  accountTypes: Array<{
    id: string
    title: string
    count: number
    totalBalance: number
  }>
  timestamp: string
}

interface ExportButtonProps {
  data: ExportData
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  // تصدير إلى CSV
  const exportToCSV = () => {
    setIsExporting(true)
    try {
      const headers = ['نوع الحساب', 'العدد', 'إجمالي الرصيد']
      const rows = data.accountTypes.map(type => [
        type.title,
        type.count.toString(),
        type.totalBalance.toString()
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // إضافة BOM لدعم UTF-8 في Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `accounts-center-${data.timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // تصدير إلى Excel (XLSX)
  const exportToExcel = () => {
    setIsExporting(true)
    try {
      // إنشاء HTML table
      const tableHTML = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; direction: rtl; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #4CAF50; color: white; font-weight: bold; }
            .summary { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2 style="text-align: center; direction: rtl;">تقرير مركز الحسابات</h2>
          <p style="direction: rtl;">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
          
          <table>
            <tr class="summary">
              <td>إجمالي الأرصدة</td>
              <td>${formatCurrency(data.totalBalance)}</td>
            </tr>
            <tr class="summary">
              <td>إجمالي عدد الحسابات</td>
              <td>${data.totalAccounts}</td>
            </tr>
          </table>
          
          <br>
          
          <table>
            <thead>
              <tr>
                <th>نوع الحساب</th>
                <th>العدد</th>
                <th>إجمالي الرصيد</th>
                <th>النسبة من الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${data.accountTypes.map(type => {
                const percentage = data.totalBalance > 0 
                  ? ((type.totalBalance / data.totalBalance) * 100).toFixed(2)
                  : '0.00'
                return `
                  <tr>
                    <td>${type.title}</td>
                    <td>${type.count}</td>
                    <td>${formatCurrency(type.totalBalance)}</td>
                    <td>${percentage}%</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `

      const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `accounts-center-${data.timestamp}.xls`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // تصدير إلى PDF
  const exportToPDF = () => {
    setIsExporting(true)
    try {
      // إنشاء نافذة طباعة مع محتوى منسق
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('يرجى السماح بالنوافذ المنبثقة لتصدير PDF')
        return
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>تقرير مركز الحسابات</title>
          <style>
            @media print {
              @page { margin: 2cm; }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              text-align: right;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #2563eb;
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            .summary-box {
              background: #f3f4f6;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #d1d5db;
            }
            .summary-item:last-child {
              border-bottom: none;
            }
            .summary-label {
              font-weight: bold;
              color: #374151;
            }
            .summary-value {
              color: #2563eb;
              font-weight: bold;
              font-size: 1.1em;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: right;
            }
            th {
              background-color: #2563eb;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 0.9em;
              border-top: 1px solid #d1d5db;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>📊 تقرير مركز الحسابات</h1>
          
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">📅 تاريخ التقرير:</span>
              <span class="summary-value">${new Date().toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">💰 إجمالي الأرصدة:</span>
              <span class="summary-value">${formatCurrency(data.totalBalance)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">🔢 إجمالي عدد الحسابات:</span>
              <span class="summary-value">${data.totalAccounts} حساب</span>
            </div>
          </div>

          <h2 style="color: #2563eb; margin-top: 30px;">تفاصيل الحسابات حسب النوع</h2>
          <table>
            <thead>
              <tr>
                <th>نوع الحساب</th>
                <th>العدد</th>
                <th>إجمالي الرصيد</th>
                <th>النسبة من الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${data.accountTypes.map(type => {
                const percentage = data.totalBalance > 0 
                  ? ((type.totalBalance / data.totalBalance) * 100).toFixed(2)
                  : '0.00'
                return `
                  <tr>
                    <td>${type.title}</td>
                    <td>${type.count}</td>
                    <td>${formatCurrency(type.totalBalance)}</td>
                    <td>${percentage}%</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً من نظام الإدارة المالية الشاملة</p>
            <p>© ${new Date().getFullYear()} - جميع الحقوق محفوظة</p>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // الانتظار قليلاً ثم فتح نافذة الطباعة
      setTimeout(() => {
        printWindow.print()
      }, 250)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // تصدير إلى JSON
  const exportToJSON = () => {
    setIsExporting(true)
    try {
      const jsonData = {
        exportDate: new Date().toISOString(),
        summary: {
          totalBalance: data.totalBalance,
          totalAccounts: data.totalAccounts,
        },
        accountTypes: data.accountTypes,
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `accounts-center-${data.timestamp}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting to JSON:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 ml-2" />
          {isExporting ? 'جاري التصدير...' : 'تصدير'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>تصدير البيانات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 ml-2" />
          تصدير PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 ml-2" />
          تصدير Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 ml-2" />
          تصدير CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 ml-2" />
          تصدير JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

