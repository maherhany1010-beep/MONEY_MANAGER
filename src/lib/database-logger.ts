/**
 * Database Logger - Logging for sensitive database operations
 * Helps track and debug database operations
 */

export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' | 'UPSERT'
export type OperationStatus = 'started' | 'success' | 'failed' | 'error'

interface LogEntry {
  timestamp: string
  operation: OperationType
  table: string
  status: OperationStatus
  userId?: string
  details?: string
  error?: string
  duration?: number
}

// Store logs in memory (in production, use a proper logging service)
const logs: LogEntry[] = []
const MAX_LOGS = 1000

/**
 * Log a database operation
 * @param operation - Type of operation (INSERT, UPDATE, DELETE, SELECT, UPSERT)
 * @param table - Table name
 * @param status - Operation status
 * @param userId - User ID (optional)
 * @param details - Additional details (optional)
 * @param error - Error message (optional)
 * @param duration - Operation duration in ms (optional)
 */
export function logDatabaseOperation(
  operation: OperationType,
  table: string,
  status: OperationStatus,
  userId?: string,
  details?: string,
  error?: string,
  duration?: number
): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    operation,
    table,
    status,
    userId,
    details,
    error,
    duration,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const statusEmoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : '⏳'
    const durationStr = duration ? ` (${duration}ms)` : ''
    console.log(
      `${statusEmoji} [DB] ${operation} on ${table}: ${status}${durationStr}`,
      details ? `- ${details}` : ''
    )
    if (error) {
      console.error(`   Error: ${error}`)
    }
  }

  // Store in memory
  logs.push(logEntry)

  // Keep only recent logs
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }
}

/**
 * Get all logs
 * @returns Array of log entries
 */
export function getLogs(): LogEntry[] {
  return [...logs]
}

/**
 * Get logs for a specific table
 * @param table - Table name
 * @returns Array of log entries for the table
 */
export function getLogsForTable(table: string): LogEntry[] {
  return logs.filter((log) => log.table === table)
}

/**
 * Get logs for a specific user
 * @param userId - User ID
 * @returns Array of log entries for the user
 */
export function getLogsForUser(userId: string): LogEntry[] {
  return logs.filter((log) => log.userId === userId)
}

/**
 * Get failed operations
 * @returns Array of failed log entries
 */
export function getFailedOperations(): LogEntry[] {
  return logs.filter((log) => log.status === 'failed' || log.status === 'error')
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logs.length = 0
}

/**
 * Get statistics
 * @returns Statistics about logged operations
 */
export function getStatistics() {
  const stats = {
    totalOperations: logs.length,
    byOperation: {} as Record<OperationType, number>,
    byTable: {} as Record<string, number>,
    byStatus: {} as Record<OperationStatus, number>,
    averageDuration: 0,
    failureRate: 0,
  }

  let totalDuration = 0
  let operationsWithDuration = 0

  logs.forEach((log) => {
    // Count by operation
    stats.byOperation[log.operation] = (stats.byOperation[log.operation] || 0) + 1

    // Count by table
    stats.byTable[log.table] = (stats.byTable[log.table] || 0) + 1

    // Count by status
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1

    // Calculate average duration
    if (log.duration) {
      totalDuration += log.duration
      operationsWithDuration++
    }
  })

  if (operationsWithDuration > 0) {
    stats.averageDuration = totalDuration / operationsWithDuration
  }

  const failedCount = (stats.byStatus['failed'] || 0) + (stats.byStatus['error'] || 0)
  if (logs.length > 0) {
    stats.failureRate = (failedCount / logs.length) * 100
  }

  return stats
}

/**
 * Export logs as JSON
 * @returns JSON string of all logs
 */
export function exportLogsAsJSON(): string {
  return JSON.stringify(logs, null, 2)
}

/**
 * Export logs as CSV
 * @returns CSV string of all logs
 */
export function exportLogsAsCSV(): string {
  if (logs.length === 0) {
    return 'No logs available'
  }

  const headers = ['Timestamp', 'Operation', 'Table', 'Status', 'User ID', 'Details', 'Error', 'Duration (ms)']
  const rows = logs.map((log) => [
    log.timestamp,
    log.operation,
    log.table,
    log.status,
    log.userId || '',
    log.details || '',
    log.error || '',
    log.duration || '',
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  return csv
}

