# 🤝 دليل المساهمة - Money Manager

## مرحباً بك!

شكراً لاهتمامك بالمساهمة في مشروع Money Manager. هذا الدليل سيساعدك على البدء.

---

## 🚀 البدء السريع

### 1. إعداد البيئة

```bash
# استنساخ المشروع
git clone https://github.com/your-repo/money-manager.git
cd money-manager

# تثبيت الاعتماديات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local
# أضف مفاتيح Supabase

# تشغيل التطبيق
npm run dev
```

### 2. التحقق من الكود

```bash
# فحص TypeScript
npm run type-check

# فحص ESLint
npm run lint

# تشغيل الاختبارات
npm run test:run
```

---

## 📋 معايير الكود

### TypeScript
- استخدم `strict mode` دائماً
- تجنب `any` - استخدم `unknown` أو أنواع محددة
- أضف JSDoc للدوال العامة

### التسمية
| النوع | النمط | مثال |
|-------|-------|------|
| المتغيرات | camelCase | `userName`, `totalBalance` |
| الثوابت | UPPER_SNAKE | `MAX_LIMIT`, `API_URL` |
| الأنواع | PascalCase | `BankAccount`, `CreditCard` |
| الملفات | kebab-case | `bank-accounts.tsx` |
| قاعدة البيانات | snake_case | `user_id`, `created_at` |

### React Components
```typescript
// ✅ صحيح
export function BankAccountCard({ account }: Props) {
  return <div>...</div>
}

// ❌ خطأ
export const BankAccountCard = (props: any) => {
  return <div>...</div>
}
```

### Error Handling
```typescript
// ✅ استخدم error-handler
import { handleError, showErrorToast } from '@/lib/error-handler'

try {
  await operation()
} catch (error) {
  handleError('Component.operation', error, true)
}
```

---

## 📁 إضافة ميزة جديدة

### 1. إنشاء Context جديد

```typescript
// src/contexts/my-feature/types.ts
export interface MyFeature {
  id: string
  name: string
  // ...
}

// src/contexts/my-feature/helpers.ts
export function transformFromDB(data: Record<string, unknown>): MyFeature {
  // ...
}

// src/contexts/my-feature/context.tsx
export function MyFeatureProvider({ children }: Props) {
  // استخدم useCrud hook
  const crud = useCrud<MyFeature>({
    tableName: 'my_features',
    enableRealtime: true,
  })
  // ...
}
```

### 2. إضافة صفحة جديدة

```typescript
// src/app/(dashboard)/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <div className="container mx-auto p-6">
      {/* المحتوى */}
    </div>
  )
}
```

---

## 🧪 كتابة الاختبارات

```typescript
// src/contexts/my-feature/__tests__/helpers.test.ts
import { describe, it, expect } from 'vitest'
import { transformFromDB } from '../helpers'

describe('transformFromDB', () => {
  it('should transform database record correctly', () => {
    const dbRecord = { id: '1', user_id: 'u1' }
    const result = transformFromDB(dbRecord)
    expect(result.id).toBe('1')
  })
})
```

---

## 📤 إرسال Pull Request

### 1. إنشاء Branch
```bash
git checkout -b feature/my-new-feature
```

### 2. Commit Messages
```bash
# النمط: type(scope): description

git commit -m "feat(cards): add new card type support"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(contexts): split large context file"
```

### 3. قبل الإرسال
```bash
npm run type-check  # لا أخطاء TypeScript
npm run lint        # لا تحذيرات ESLint
npm run test:run    # جميع الاختبارات ناجحة
```

### 4. إنشاء PR
- عنوان واضح يصف التغيير
- وصف مفصل للتغييرات
- ربط بـ Issue إن وجد

---

## ❓ أسئلة؟

إذا كان لديك أي أسئلة، لا تتردد في فتح Issue جديد.

**شكراً لمساهمتك! 🙏**

