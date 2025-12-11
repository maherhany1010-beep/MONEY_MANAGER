'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

// شعارات البنوك والشركات المصرية الفعلية
interface FinancialItem {
  label: string
  logo: string
  bgColor: string
  shadowColor: string
}

// جميع الشعارات - 23 شعار فريد (بدون اللوجو الرئيسي)
const financialItems: FinancialItem[] = [
  // البنوك المصرية
  { label: 'بنك مصر', logo: '/logos/banque-misr.png', bgColor: 'bg-red-900/20', shadowColor: 'rgba(220, 38, 38, 0.5)' },
  { label: 'CIB', logo: '/logos/cib.png', bgColor: 'bg-blue-900/20', shadowColor: 'rgba(37, 99, 235, 0.5)' },
  { label: 'البنك الأهلي', logo: '/logos/nbe.png', bgColor: 'bg-green-900/20', shadowColor: 'rgba(34, 197, 94, 0.5)' },
  { label: 'Emirates NBD', logo: '/logos/emirates-nbd.png', bgColor: 'bg-green-700/20', shadowColor: 'rgba(52, 211, 153, 0.5)' },

  // المحافظ الإلكترونية
  { label: 'فودافون كاش', logo: '/logos/vodafone.png', bgColor: 'bg-red-700/20', shadowColor: 'rgba(248, 113, 113, 0.5)' },
  { label: 'أورنج كاش', logo: '/logos/orange.png', bgColor: 'bg-orange-900/20', shadowColor: 'rgba(249, 115, 22, 0.5)' },
  { label: 'زين كاش', logo: '/logos/zain.png', bgColor: 'bg-red-800/20', shadowColor: 'rgba(239, 68, 68, 0.5)' },

  // أنظمة الدفع
  { label: 'InstaPay', logo: '/logos/instapay.png', bgColor: 'bg-purple-900/20', shadowColor: 'rgba(168, 85, 247, 0.5)' },
  { label: 'ميزة', logo: '/logos/meeza.png', bgColor: 'bg-blue-700/20', shadowColor: 'rgba(96, 165, 250, 0.5)' },
  { label: 'Visa', logo: '/logos/visa.png', bgColor: 'bg-blue-600/20', shadowColor: 'rgba(147, 197, 253, 0.5)' },
  { label: 'ماستر كارد', logo: '/logos/ماستر كارد.png', bgColor: 'bg-orange-800/20', shadowColor: 'rgba(251, 146, 60, 0.5)' },
  { label: 'World Elite', logo: '/logos/WorldElite.png', bgColor: 'bg-amber-900/20', shadowColor: 'rgba(251, 191, 36, 0.5)' },

  // فورى وأمان
  { label: 'فورى', logo: '/logos/لوجو فورى.png', bgColor: 'bg-yellow-800/20', shadowColor: 'rgba(250, 204, 21, 0.5)' },
  { label: 'كارت فورى', logo: '/logos/كارت فورى الأصفر.png', bgColor: 'bg-yellow-700/20', shadowColor: 'rgba(253, 224, 71, 0.5)' },
  { label: 'أمان', logo: '/logos/aman.png', bgColor: 'bg-green-800/20', shadowColor: 'rgba(74, 222, 128, 0.5)' },
  { label: 'لوجو أمان', logo: '/logos/لوجو أمان.png', bgColor: 'bg-green-700/20', shadowColor: 'rgba(52, 211, 153, 0.5)' },

  // بطاقات وكروت
  { label: 'كارت كليفر', logo: '/logos/كارت كليفر.png', bgColor: 'bg-teal-900/20', shadowColor: 'rgba(45, 212, 191, 0.5)' },
  { label: 'كارت تيلدا', logo: '/logos/كارت تيلدا.png', bgColor: 'bg-cyan-900/20', shadowColor: 'rgba(103, 232, 249, 0.5)' },
  { label: 'بطاقات البنك الأهلي', logo: '/logos/بطاقات-البنك-الأهلي.png', bgColor: 'bg-green-600/20', shadowColor: 'rgba(34, 197, 94, 0.5)' },

  // خدمات أخرى
  { label: 'تحويل أموال', logo: '/logos/تحويل أموال.png', bgColor: 'bg-purple-800/20', shadowColor: 'rgba(147, 51, 234, 0.5)' },
  { label: 'استثمار', logo: '/logos/investment.png', bgColor: 'bg-emerald-900/20', shadowColor: 'rgba(16, 185, 129, 0.5)' },
  { label: 'دوائر الادخار', logo: '/logos/savings-circles.png', bgColor: 'bg-pink-900/20', shadowColor: 'rgba(236, 72, 153, 0.5)' },
]

// 13 مسار فريد - كل شعار له مسار خاص (نصف العدد لتقليل الازدحام)
const logoAnimationPaths = [
  // حركة قطرية من أعلى إلى أسفل (يمين) - 5 مسارات
  { start: { x: 0, y: -10 }, end: { x: 15, y: 110 } },
  { start: { x: 16, y: -10 }, end: { x: 30, y: 110 } },
  { start: { x: 32, y: -10 }, end: { x: 46, y: 110 } },
  { start: { x: 48, y: -10 }, end: { x: 62, y: 110 } },
  { start: { x: 64, y: -10 }, end: { x: 78, y: 110 } },

  // حركة قطرية من أعلى إلى أسفل (يسار) - 3 مسارات
  { start: { x: 100, y: -10 }, end: { x: 85, y: 110 } },
  { start: { x: 84, y: -10 }, end: { x: 70, y: 110 } },
  { start: { x: 68, y: -10 }, end: { x: 54, y: 110 } },

  // حركة أفقية (يسار إلى يمين) - 3 مسارات
  { start: { x: -10, y: 25 }, end: { x: 110, y: 30 } },
  { start: { x: -10, y: 50 }, end: { x: 110, y: 55 } },
  { start: { x: -10, y: 75 }, end: { x: 110, y: 80 } },

  // حركة أفقية (يمين إلى يسار) - 2 مسارات
  { start: { x: 110, y: 35 }, end: { x: -10, y: 40 } },
  { start: { x: 110, y: 65 }, end: { x: -10, y: 70 } },
]

// مكون شعار متحرك محسّن للأداء
function FloatingLogo({ item, index }: { item: FinancialItem; index: number }) {
  const { logo, label, shadowColor } = item

  // اختيار مسار الحركة
  const path = logoAnimationPaths[index % logoAnimationPaths.length]

  // مدة الحركة (35-50 ثانية) - حركة بطيئة وسلسة
  const duration = 35 + (index % 15)

  // تأخير البداية - 0.1 ثانية بين كل شعار (ظهور فوري تقريباً)
  // إجمالي الوقت = 13 * 0.1 = 1.3 ثانية لظهور جميع الشعارات
  const delay = index * 0.1

  // حساب المسافة للحركة
  const deltaX = path.end.x - path.start.x
  const deltaY = path.end.y - path.start.y

  // إضافة offset عشوائي لنقطة البداية لتنويع الظهور
  const randomOffsetX = (index * 7) % 20 - 10 // قيمة بين -10 و 10
  const randomOffsetY = (index * 11) % 30 - 15 // قيمة بين -15 و 15

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${path.start.x + randomOffsetX}%`,
        top: `${path.start.y + randomOffsetY}%`,
        willChange: 'transform, opacity',
      }}
      initial={{
        scale: 1, // تبدأ بالحجم الكامل
        opacity: 0.7, // تبدأ مرئية
      }}
      animate={{
        scale: [1, 1, 1, 0],
        opacity: [0.7, 0.7, 0.7, 0],
        x: [`0vw`, `${deltaX}vw`],
        y: [`0vh`, `${deltaY}vh`],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut', // حركة سلسة بدلاً من linear
        repeatDelay: 0,
      }}
    >
      {/* تصميم بسيط بدون تأثيرات ثقيلة */}
      <div className="relative">
        {/* Logo Container - بسيط وخفيف */}
        <div
          className="relative bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40"
          style={{
            boxShadow: `0 2px 12px ${shadowColor}`,
          }}
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src={logo}
              alt={label}
              width={40}
              height={40}
              className="object-contain"
              loading="lazy"
              quality={75}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlays */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        style={{ transform: 'translate(50%, 50%)' }}
      />

      {/* Animated financial logos - عرض 13 شعار فقط لتقليل الازدحام */}
      {financialItems.slice(0, 13).map((item, index) => (
        <FloatingLogo key={`${item.label}-${index}`} item={item} index={index} />
      ))}
    </div>
  )
}

