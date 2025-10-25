'use client'

import { memo, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

/**
 * Optimized Chart Component with memoization
 */

interface OptimizedLineChartProps {
  data: any[]
  dataKey: string
  xAxisKey: string
  color?: string
  height?: number
}

export const OptimizedLineChart = memo(function OptimizedLineChart({
  data,
  dataKey,
  xAxisKey,
  color = '#3B82F6',
  height = 300,
}: OptimizedLineChartProps) {
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => data, [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

interface OptimizedBarChartProps {
  data: any[]
  dataKey: string
  xAxisKey: string
  color?: string
  height?: number
}

export const OptimizedBarChart = memo(function OptimizedBarChart({
  data,
  dataKey,
  xAxisKey,
  color = '#3B82F6',
  height = 300,
}: OptimizedBarChartProps) {
  const chartData = useMemo(() => data, [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[8, 8, 0, 0]}
          animationDuration={500}
        />
      </BarChart>
    </ResponsiveContainer>
  )
})

interface OptimizedPieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  colors?: string[]
  height?: number
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

export const OptimizedPieChart = memo(function OptimizedPieChart({
  data,
  dataKey,
  nameKey,
  colors = DEFAULT_COLORS,
  height = 300,
}: OptimizedPieChartProps) {
  const chartData = useMemo(() => data, [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry: any) => entry[nameKey] as any}
          animationDuration={500}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
})

interface MultiLineChartProps {
  data: any[]
  lines: Array<{
    dataKey: string
    color: string
    name: string
  }>
  xAxisKey: string
  height?: number
}

export const OptimizedMultiLineChart = memo(function OptimizedMultiLineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
}: MultiLineChartProps) {
  const chartData = useMemo(() => data, [data])
  const chartLines = useMemo(() => lines, [lines])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        {chartLines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={line.name}
            animationDuration={500}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
})

interface MultiBarChartProps {
  data: any[]
  bars: Array<{
    dataKey: string
    color: string
    name: string
  }>
  xAxisKey: string
  height?: number
}

export const OptimizedMultiBarChart = memo(function OptimizedMultiBarChart({
  data,
  bars,
  xAxisKey,
  height = 300,
}: MultiBarChartProps) {
  const chartData = useMemo(() => data, [data])
  const chartBars = useMemo(() => bars, [bars])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        {chartBars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            radius={[8, 8, 0, 0]}
            name={bar.name}
            animationDuration={500}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
})

