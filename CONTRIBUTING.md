# دليل المساهمة

شكراً لاهتمامك بالمساهمة في مشروع Money Manager! 🎉

## كيفية المساهمة

### 1. Fork المستودع
```bash
git clone https://github.com/maherhany1010-beep/MONEY_MANAGER.git
cd MONEY_MANAGER
```

### 2. إنشاء فرع جديد
```bash
git checkout -b feature/your-feature-name
```

### 3. إجراء التغييرات
- اتبع معايير الكود الموجودة
- أضف تعليقات واضحة للكود المعقد
- تأكد من أن الكود يعمل محلياً

### 4. الاختبار
```bash
npm run build
npm run lint
npm start
```

### 5. Commit التغييرات
```bash
git add .
git commit -m "feat: وصف واضح للميزة الجديدة"
```

### 6. Push والـ Pull Request
```bash
git push origin feature/your-feature-name
```

---

## معايير الكود

### TypeScript
- استخدم TypeScript بشكل صارم
- تجنب `any` قدر الإمكان
- أضف أنواع واضحة للدوال والمتغيرات

### React
- استخدم Functional Components
- استخدم Hooks بشكل صحيح
- تجنب الـ prop drilling - استخدم Context API

### التسمية
- استخدم camelCase للمتغيرات والدوال
- استخدم PascalCase للمكونات
- استخدم UPPER_CASE للثوابت

### التعليقات
```typescript
// ✅ جيد
// حساب إجمالي الرصيد من جميع البطاقات
const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0)

// ❌ سيء
// loop through cards
const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0)
```

---

## قواعم الـ Commit

استخدم الصيغة التالية:
```
type(scope): subject

body

footer
```

**Types:**
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تحديثات التوثيق
- `style`: تنسيق الكود
- `refactor`: إعادة هيكلة الكود
- `perf`: تحسينات الأداء
- `test`: إضافة اختبارات

**مثال:**
```
feat(cards): إضافة ميزة الكاش باك

- إضافة حساب الكاش باك التلقائي
- إضافة تقرير الكاش باك الشهري
- تحديث واجهة المستخدم

Closes #123
```

---

## الإبلاغ عن الأخطاء

عند الإبلاغ عن خطأ، يرجى تضمين:
1. وصف واضح للمشكلة
2. خطوات إعادة الإنتاج
3. السلوك المتوقع
4. السلوك الفعلي
5. لقطات شاشة (إن أمكن)

---

## الأسئلة والمناقشات

للأسئلة والمناقشات، يرجى فتح Issue جديد مع العلامة `question`.

---

شكراً لمساهمتك! 🙏

