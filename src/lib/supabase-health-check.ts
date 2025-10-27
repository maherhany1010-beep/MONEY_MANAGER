/**
 * Supabase Health Check
 * Verifies connection and basic functionality
 */

import { createServerComponentClient } from './supabase-server'

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  checks: {
    connection: boolean
    database: boolean
    auth: boolean
    rls: boolean
  }
  errors: string[]
  details: Record<string, any>
}

/**
 * Perform a complete health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      connection: false,
      database: false,
      auth: false,
      rls: false,
    },
    errors: [],
    details: {},
  }

  try {
    // Check 1: Connection
    try {
      const supabase = await createServerComponentClient()
      result.checks.connection = true
      result.details.connection = 'Connected to Supabase'
    } catch (error) {
      result.checks.connection = false
      result.errors.push(`Connection failed: ${error}`)
    }

    // Check 2: Database
    if (result.checks.connection) {
      try {
        const supabase = await createServerComponentClient()
        const { data, error } = await supabase
          .from('credit_cards')
          .select('count(*)', { count: 'exact', head: true })

        if (error) {
          result.checks.database = false
          result.errors.push(`Database check failed: ${error.message}`)
        } else {
          result.checks.database = true
          result.details.database = 'Database is accessible'
        }
      } catch (error) {
        result.checks.database = false
        result.errors.push(`Database error: ${error}`)
      }
    }

    // Check 3: Authentication
    if (result.checks.connection) {
      try {
        const supabase = await createServerComponentClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          result.checks.auth = false
          result.errors.push(`Auth check failed: ${error.message}`)
        } else {
          result.checks.auth = true
          result.details.auth = data.session ? 'User authenticated' : 'No active session'
        }
      } catch (error) {
        result.checks.auth = false
        result.errors.push(`Auth error: ${error}`)
      }
    }

    // Check 4: RLS (Row Level Security)
    if (result.checks.connection && result.checks.database) {
      try {
        const supabase = await createServerComponentClient()
        const { data, error } = await supabase
          .from('credit_cards')
          .select('id')
          .limit(1)

        if (error && error.message.includes('permission')) {
          result.checks.rls = true
          result.details.rls = 'RLS is properly configured'
        } else if (error) {
          result.checks.rls = false
          result.errors.push(`RLS check failed: ${error.message}`)
        } else {
          result.checks.rls = true
          result.details.rls = 'RLS is properly configured'
        }
      } catch (error) {
        result.checks.rls = false
        result.errors.push(`RLS error: ${error}`)
      }
    }

    // Determine overall status
    const checksArray = Object.values(result.checks)
    const passedChecks = checksArray.filter((check) => check).length

    if (passedChecks === checksArray.length) {
      result.status = 'healthy'
    } else if (passedChecks >= checksArray.length / 2) {
      result.status = 'degraded'
    } else {
      result.status = 'unhealthy'
    }
  } catch (error) {
    result.status = 'unhealthy'
    result.errors.push(`Health check failed: ${error}`)
  }

  return result
}

/**
 * Check if Supabase is healthy
 */
export async function isSupabaseHealthy(): Promise<boolean> {
  const result = await performHealthCheck()
  return result.status === 'healthy'
}

/**
 * Get health check summary
 */
export async function getHealthCheckSummary(): Promise<string> {
  const result = await performHealthCheck()

  const summary = `
Supabase Health Check - ${result.timestamp}
Status: ${result.status.toUpperCase()}

Checks:
- Connection: ${result.checks.connection ? '✅' : '❌'}
- Database: ${result.checks.database ? '✅' : '❌'}
- Authentication: ${result.checks.auth ? '✅' : '❌'}
- RLS: ${result.checks.rls ? '✅' : '❌'}

${result.errors.length > 0 ? `Errors:\n${result.errors.map((e) => `- ${e}`).join('\n')}` : 'No errors'}

Details:
${Object.entries(result.details)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}
  `.trim()

  return summary
}

