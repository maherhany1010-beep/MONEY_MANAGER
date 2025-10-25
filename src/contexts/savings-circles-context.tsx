'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type {
  SavingsCircle,
  CircleMember,
  CirclePayment,
  CirclePayout,
  CircleStats,
  CircleFilter,
  CircleFormData,
  PaymentFormData,
  PayoutFormData,
} from '@/types/savings-circles'

interface SavingsCirclesContextType {
  // البيانات
  circles: SavingsCircle[]
  payments: CirclePayment[]
  payouts: CirclePayout[]
  
  // الإحصائيات
  stats: CircleStats
  
  // الفلاتر
  filter: CircleFilter
  setFilter: (filter: CircleFilter) => void
  
  // العمليات على الجمعيات
  addCircle: (circleData: CircleFormData) => void
  updateCircle: (id: string, circleData: Partial<SavingsCircle>) => void
  deleteCircle: (id: string) => void
  getCircleById: (id: string) => SavingsCircle | undefined
  
  // العمليات على الأعضاء
  addMember: (circleId: string, memberData: Omit<CircleMember, 'id' | 'hasPaid' | 'hasReceived' | 'totalPaid' | 'status' | 'createdAt' | 'updatedAt'>) => void
  updateMember: (circleId: string, memberId: string, memberData: Partial<CircleMember>) => void
  removeMember: (circleId: string, memberId: string) => void
  
  // العمليات على الدفعات
  addPayment: (paymentData: Omit<CirclePayment, 'id' | 'createdAt'>) => void
  deletePayment: (id: string) => void
  
  // العمليات على الاستلامات
  addPayout: (payoutData: Omit<CirclePayout, 'id' | 'createdAt'>) => void
  deletePayout: (id: string) => void
  
  // دوال مساعدة
  getFilteredCircles: () => SavingsCircle[]
  getCirclePayments: (circleId: string) => CirclePayment[]
  getCirclePayouts: (circleId: string) => CirclePayout[]
  getMemberPayments: (circleId: string, memberId: string) => CirclePayment[]
  calculateCircleStats: (circleId: string) => {
    totalCollected: number
    totalDistributed: number
    totalFees: number
    currentBalance: number
    paymentRate: number
  }
}

const SavingsCirclesContext = createContext<SavingsCirclesContextType | undefined>(undefined)

export function SavingsCirclesProvider({ children }: { children: React.ReactNode }) {
  const [circles, setCircles] = useState<SavingsCircle[]>([])
  const [payments, setPayments] = useState<CirclePayment[]>([])
  const [payouts, setPayouts] = useState<CirclePayout[]>([])
  const [filter, setFilter] = useState<CircleFilter>({})

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedCircles = localStorage.getItem('savingsCircles')
    const savedPayments = localStorage.getItem('circlePayments')
    const savedPayouts = localStorage.getItem('circlePayouts')

    if (savedCircles) setCircles(JSON.parse(savedCircles))
    if (savedPayments) setPayments(JSON.parse(savedPayments))
    if (savedPayouts) setPayouts(JSON.parse(savedPayouts))
  }, [])

  // حفظ البيانات في localStorage
  useEffect(() => {
    localStorage.setItem('savingsCircles', JSON.stringify(circles))
  }, [circles])

  useEffect(() => {
    localStorage.setItem('circlePayments', JSON.stringify(payments))
  }, [payments])

  useEffect(() => {
    localStorage.setItem('circlePayouts', JSON.stringify(payouts))
  }, [payouts])

  // إضافة جمعية جديدة
  const addCircle = useCallback((circleData: CircleFormData) => {
    const monthlyAmount = parseFloat(circleData.monthlyAmount)
    const totalMembers = parseInt(circleData.totalMembers)
    const duration = parseInt(circleData.duration)
    
    const startDate = new Date(circleData.startDate)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + duration)

    const members: CircleMember[] = circleData.members.map((member, index) => ({
      ...member,
      id: `member-${Date.now()}-${index}`,
      hasPaid: Array(duration).fill(false),
      hasReceived: false,
      totalPaid: 0,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    const newCircle: SavingsCircle = {
      id: `circle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: circleData.name,
      description: circleData.description,
      type: circleData.type,
      role: circleData.role,
      monthlyAmount,
      totalMembers,
      duration,
      startDate: circleData.startDate,
      endDate: endDate.toISOString().split('T')[0],
      hasFees: circleData.hasFees,
      managementFee: circleData.managementFee ? parseFloat(circleData.managementFee) : undefined,
      feeType: circleData.feeType,
      lateFee: circleData.lateFee ? parseFloat(circleData.lateFee) : undefined,
      earlyWithdrawalFee: circleData.earlyWithdrawalFee ? parseFloat(circleData.earlyWithdrawalFee) : undefined,
      status: 'active',
      currentRound: 1,
      members,
      paymentMethod: circleData.paymentMethod,
      linkedAccountId: circleData.linkedAccountId,
      linkedAccountType: circleData.linkedAccountType,
      myTurnNumber: circleData.myTurnNumber ? parseInt(circleData.myTurnNumber) : undefined,
      appName: circleData.appName,
      appAccountId: circleData.appAccountId,
      totalCollected: 0,
      totalDistributed: 0,
      totalFees: 0,
      currentBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCircles(prev => [...prev, newCircle])
  }, [])

  // تحديث جمعية
  const updateCircle = useCallback((id: string, circleData: Partial<SavingsCircle>) => {
    setCircles(prev => prev.map(circle =>
      circle.id === id
        ? { ...circle, ...circleData, updatedAt: new Date().toISOString() }
        : circle
    ))
  }, [])

  // حذف جمعية
  const deleteCircle = useCallback((id: string) => {
    setCircles(prev => prev.filter(circle => circle.id !== id))
    setPayments(prev => prev.filter(payment => payment.circleId !== id))
    setPayouts(prev => prev.filter(payout => payout.circleId !== id))
  }, [])

  // الحصول على جمعية بالمعرف
  const getCircleById = useCallback((id: string) => {
    return circles.find(circle => circle.id === id)
  }, [circles])

  // إضافة عضو
  const addMember = useCallback((circleId: string, memberData: Omit<CircleMember, 'id' | 'hasPaid' | 'hasReceived' | 'totalPaid' | 'status' | 'createdAt' | 'updatedAt'>) => {
    setCircles(prev => prev.map(circle => {
      if (circle.id === circleId) {
        const newMember: CircleMember = {
          ...memberData,
          id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          hasPaid: Array(circle.duration).fill(false),
          hasReceived: false,
          totalPaid: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return {
          ...circle,
          members: [...circle.members, newMember],
          totalMembers: circle.totalMembers + 1,
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [])

  // تحديث عضو
  const updateMember = useCallback((circleId: string, memberId: string, memberData: Partial<CircleMember>) => {
    setCircles(prev => prev.map(circle => {
      if (circle.id === circleId) {
        return {
          ...circle,
          members: circle.members.map(member =>
            member.id === memberId
              ? { ...member, ...memberData, updatedAt: new Date().toISOString() }
              : member
          ),
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [])

  // حذف عضو
  const removeMember = useCallback((circleId: string, memberId: string) => {
    setCircles(prev => prev.map(circle => {
      if (circle.id === circleId) {
        return {
          ...circle,
          members: circle.members.filter(member => member.id !== memberId),
          totalMembers: circle.totalMembers - 1,
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [])

  // إضافة دفعة
  const addPayment = useCallback((paymentData: Omit<CirclePayment, 'id' | 'createdAt'>) => {
    const newPayment: CirclePayment = {
      ...paymentData,
      id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    setPayments(prev => [...prev, newPayment])

    // تحديث سجل الدفع للعضو
    setCircles(prev => prev.map(circle => {
      if (circle.id === paymentData.circleId) {
        const updatedMembers = circle.members.map(member => {
          if (member.id === paymentData.memberId) {
            const hasPaid = [...member.hasPaid]
            hasPaid[paymentData.roundNumber - 1] = true
            return {
              ...member,
              hasPaid,
              totalPaid: member.totalPaid + paymentData.amount,
              updatedAt: new Date().toISOString(),
            }
          }
          return member
        })

        return {
          ...circle,
          members: updatedMembers,
          totalCollected: circle.totalCollected + paymentData.amount,
          currentBalance: circle.currentBalance + paymentData.amount,
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [])

  // حذف دفعة
  const deletePayment = useCallback((id: string) => {
    const payment = payments.find(p => p.id === id)
    if (!payment) return

    setPayments(prev => prev.filter(p => p.id !== id))

    // تحديث سجل الدفع للعضو
    setCircles(prev => prev.map(circle => {
      if (circle.id === payment.circleId) {
        const updatedMembers = circle.members.map(member => {
          if (member.id === payment.memberId) {
            const hasPaid = [...member.hasPaid]
            hasPaid[payment.roundNumber - 1] = false
            return {
              ...member,
              hasPaid,
              totalPaid: member.totalPaid - payment.amount,
              updatedAt: new Date().toISOString(),
            }
          }
          return member
        })

        return {
          ...circle,
          members: updatedMembers,
          totalCollected: circle.totalCollected - payment.amount,
          currentBalance: circle.currentBalance - payment.amount,
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [payments])

  // إضافة استلام
  const addPayout = useCallback((payoutData: Omit<CirclePayout, 'id' | 'createdAt'>) => {
    const newPayout: CirclePayout = {
      ...payoutData,
      id: `payout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    setPayouts(prev => [...prev, newPayout])

    // تحديث حالة الاستلام للعضو
    setCircles(prev => prev.map(circle => {
      if (circle.id === payoutData.circleId) {
        const updatedMembers = circle.members.map(member => {
          if (member.id === payoutData.memberId) {
            return {
              ...member,
              hasReceived: true,
              receivedDate: payoutData.payoutDate,
              receivedAmount: payoutData.netAmount,
              updatedAt: new Date().toISOString(),
            }
          }
          return member
        })

        return {
          ...circle,
          members: updatedMembers,
          totalDistributed: circle.totalDistributed + payoutData.netAmount,
          totalFees: circle.totalFees + (payoutData.fees || 0),
          currentBalance: circle.currentBalance - payoutData.amount,
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [])

  // حذف استلام
  const deletePayout = useCallback((id: string) => {
    const payout = payouts.find(p => p.id === id)
    if (!payout) return

    setPayouts(prev => prev.filter(p => p.id !== id))

    // تحديث حالة الاستلام للعضو
    setCircles(prev => prev.map(circle => {
      if (circle.id === payout.circleId) {
        const updatedMembers = circle.members.map(member => {
          if (member.id === payout.memberId) {
            return {
              ...member,
              hasReceived: false,
              receivedDate: undefined,
              receivedAmount: undefined,
              updatedAt: new Date().toISOString(),
            }
          }
          return member
        })

        return {
          ...circle,
          members: updatedMembers,
          totalDistributed: circle.totalDistributed - payout.netAmount,
          totalFees: circle.totalFees - (payout.fees || 0),
          currentBalance: circle.currentBalance + payout.amount,
          updatedAt: new Date().toISOString(),
        }
      }
      return circle
    }))
  }, [payouts])

  // الحصول على الجمعيات المفلترة
  const getFilteredCircles = useCallback(() => {
    return circles.filter(circle => {
      if (filter.role && circle.role !== filter.role) return false
      if (filter.status && circle.status !== filter.status) return false
      if (filter.type && circle.type !== filter.type) return false
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase()
        return (
          circle.name.toLowerCase().includes(query) ||
          circle.description?.toLowerCase().includes(query) ||
          circle.appName?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [circles, filter])

  // الحصول على دفعات جمعية
  const getCirclePayments = useCallback((circleId: string) => {
    return payments.filter(payment => payment.circleId === circleId)
  }, [payments])

  // الحصول على استلامات جمعية
  const getCirclePayouts = useCallback((circleId: string) => {
    return payouts.filter(payout => payout.circleId === circleId)
  }, [payouts])

  // الحصول على دفعات عضو
  const getMemberPayments = useCallback((circleId: string, memberId: string) => {
    return payments.filter(payment =>
      payment.circleId === circleId && payment.memberId === memberId
    )
  }, [payments])

  // حساب إحصائيات جمعية
  const calculateCircleStats = useCallback((circleId: string) => {
    const circle = circles.find(c => c.id === circleId)
    if (!circle) {
      return { totalCollected: 0, totalDistributed: 0, totalFees: 0, currentBalance: 0, paymentRate: 0 }
    }

    const circlePayments = payments.filter(p => p.circleId === circleId)
    const circlePayouts = payouts.filter(p => p.circleId === circleId)

    const totalCollected = circlePayments.reduce((sum, p) => sum + p.amount, 0)
    const totalDistributed = circlePayouts.reduce((sum, p) => sum + p.netAmount, 0)
    const totalFees = circlePayouts.reduce((sum, p) => sum + (p.fees || 0), 0)
    const currentBalance = totalCollected - totalDistributed - totalFees

    // حساب نسبة الالتزام بالدفع
    const totalExpectedPayments = circle.totalMembers * circle.currentRound
    const totalActualPayments = circle.members.reduce((sum, member) =>
      sum + member.hasPaid.slice(0, circle.currentRound).filter(Boolean).length, 0
    )
    const paymentRate = totalExpectedPayments > 0 ? (totalActualPayments / totalExpectedPayments) * 100 : 0

    return { totalCollected, totalDistributed, totalFees, currentBalance, paymentRate }
  }, [circles, payments, payouts])

  // حساب الإحصائيات العامة
  const stats: CircleStats = {
    totalCircles: circles.length,
    activeCircles: circles.filter(c => c.status === 'active').length,
    completedCircles: circles.filter(c => c.status === 'completed').length,
    cancelledCircles: circles.filter(c => c.status === 'cancelled').length,
    totalMonthlyCommitment: circles
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.role === 'member' ? c.monthlyAmount : 0), 0),
    totalInCircles: circles.reduce((sum, c) => sum + c.currentBalance, 0),
    totalFeesEarned: circles
      .filter(c => c.role === 'manager')
      .reduce((sum, c) => sum + c.totalFees, 0),
    averageMonthlyAmount: circles.length > 0
      ? circles.reduce((sum, c) => sum + c.monthlyAmount, 0) / circles.length
      : 0,
    upcomingPayouts: [],
    overduePayments: [],
  }

  const value: SavingsCirclesContextType = {
    circles,
    payments,
    payouts,
    stats,
    filter,
    setFilter,
    addCircle,
    updateCircle,
    deleteCircle,
    getCircleById,
    addMember,
    updateMember,
    removeMember,
    addPayment,
    deletePayment,
    addPayout,
    deletePayout,
    getFilteredCircles,
    getCirclePayments,
    getCirclePayouts,
    getMemberPayments,
    calculateCircleStats,
  }

  return (
    <SavingsCirclesContext.Provider value={value}>
      {children}
    </SavingsCirclesContext.Provider>
  )
}

export function useSavingsCircles() {
  const context = useContext(SavingsCirclesContext)
  if (context === undefined) {
    throw new Error('useSavingsCircles must be used within a SavingsCirclesProvider')
  }
  return context
}

