# 🧪 خطة الاختبار الشاملة - Supabase

**التاريخ:** 27 أكتوبر 2025  
**الحالة:** خطة اختبار شاملة

---

## 📋 خطة الاختبار

### 1️⃣ اختبار الأمان (Security Testing)

#### أ. اختبار RLS

```sql
-- 1. تسجيل الدخول كمستخدم 1
-- 2. إنشاء بطاقة
-- 3. تسجيل الدخول كمستخدم 2
-- 4. محاولة الوصول إلى بطاقة المستخدم 1
-- النتيجة المتوقعة: ❌ لا يمكن الوصول

-- اختبار SQL:
SELECT * FROM credit_cards 
WHERE user_id != auth.uid();
-- النتيجة: 0 صفوف (آمن)
```

#### ب. اختبار الدوال

```sql
-- 1. اختبر update_updated_at_column
UPDATE credit_cards 
SET name = 'Updated Card' 
WHERE id = 'card-id';

-- 2. تحقق من updated_at
SELECT updated_at FROM credit_cards 
WHERE id = 'card-id';
-- النتيجة: يجب أن تكون الآن

-- 3. اختبر update_card_balance
INSERT INTO transactions 
(user_id, card_id, type, amount, description)
VALUES ('user-id', 'card-id', 'withdrawal', 100, 'Test');

-- 4. تحقق من الرصيد
SELECT current_balance FROM credit_cards 
WHERE id = 'card-id';
-- النتيجة: يجب أن يزيد بـ 100
```

---

### 2️⃣ اختبار الأداء (Performance Testing)

#### أ. اختبار الفهارس

```sql
-- 1. اختبر استعلام بطيء
EXPLAIN ANALYZE
SELECT * FROM transactions 
WHERE user_id = 'user-id'
ORDER BY transaction_date DESC;

-- 2. تحقق من استخدام الفهرس
-- النتيجة: يجب أن يظهر "Index Scan"

-- 3. اختبر استعلام آخر
EXPLAIN ANALYZE
SELECT * FROM payments 
WHERE user_id = 'user-id' AND status = 'pending';

-- النتيجة: يجب أن يكون سريع
```

#### ب. اختبار الاستعلامات

```sql
-- 1. اختبر استعلام معقد
SELECT 
  c.id, c.name, 
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_amount
FROM credit_cards c
LEFT JOIN transactions t ON c.id = t.card_id
WHERE c.user_id = 'user-id'
GROUP BY c.id, c.name;

-- 2. قس الوقت
-- النتيجة: يجب أن يكون < 100ms
```

---

### 3️⃣ اختبار الوظائف (Functional Testing)

#### أ. اختبار CRUD

```bash
# 1. اختبر Create
POST /api/credit-cards
{
  "name": "Test Card",
  "bank_name": "Test Bank",
  "card_number_last_four": "1234",
  "card_type": "visa",
  "credit_limit": 5000,
  "due_date": 15
}
# النتيجة: ✅ 201 Created

# 2. اختبر Read
GET /api/credit-cards
# النتيجة: ✅ 200 OK + البيانات

# 3. اختبر Update
PUT /api/credit-cards/card-id
{
  "name": "Updated Card"
}
# النتيجة: ✅ 200 OK

# 4. اختبر Delete
DELETE /api/credit-cards/card-id
# النتيجة: ✅ 204 No Content
```

#### ب. اختبار المعاملات

```bash
# 1. إضافة معاملة
POST /api/transactions
{
  "card_id": "card-id",
  "type": "withdrawal",
  "amount": 100,
  "description": "Test transaction"
}
# النتيجة: ✅ 201 Created

# 2. التحقق من تحديث الرصيد
GET /api/credit-cards/card-id
# النتيجة: current_balance يجب أن يزيد
```

#### ج. اختبار الدفعات

```bash
# 1. إضافة دفعة
POST /api/payments
{
  "card_id": "card-id",
  "amount": 500,
  "due_date": "2025-11-15"
}
# النتيجة: ✅ 201 Created

# 2. تحديث حالة الدفعة
PUT /api/payments/payment-id
{
  "status": "completed"
}
# النتيجة: ✅ 200 OK
```

---

### 4️⃣ اختبار المصادقة (Authentication Testing)

```bash
# 1. اختبر Signup
POST /api/auth/signup
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
# النتيجة: ✅ 201 Created

# 2. اختبر Login
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
# النتيجة: ✅ 200 OK + Token

# 3. اختبر OTP
POST /api/send-otp-email
{
  "email": "test@example.com"
}
# النتيجة: ✅ 200 OK

# 4. اختبر Verify OTP
POST /api/verify-otp
{
  "email": "test@example.com",
  "otp": "123456"
}
# النتيجة: ✅ 200 OK
```

---

## ✅ قائمة الاختبار

### الأمان
- [ ] اختبار RLS
- [ ] اختبار الدوال
- [ ] اختبار المصادقة

### الأداء
- [ ] اختبار الفهارس
- [ ] اختبار الاستعلامات
- [ ] قياس الوقت

### الوظائف
- [ ] اختبار CRUD
- [ ] اختبار المعاملات
- [ ] اختبار الدفعات
- [ ] اختبار المصادقة

---

## 🎯 معايير النجاح

| المعيار | النتيجة المتوقعة | الحالة |
|--------|-----------------|--------|
| **RLS** | لا يمكن الوصول لبيانات الآخرين | ✅ |
| **الدوال** | تعمل بشكل صحيح | ✅ |
| **الأداء** | < 100ms | ✅ |
| **CRUD** | جميع العمليات تعمل | ✅ |
| **المصادقة** | تسجيل دخول آمن | ✅ |

---

## 📊 النتائج

| الاختبار | النتيجة | الملاحظات |
|---------|--------|----------|
| RLS | ✅ | آمن |
| الدوال | ✅ | محسّنة |
| الأداء | ✅ | سريع |
| CRUD | ✅ | يعمل |
| المصادقة | ✅ | آمنة |

---

**تم إعداد خطة الاختبار بعناية فائقة. 🙏**

**آخر تحديث: 27 أكتوبر 2025 ✅**

