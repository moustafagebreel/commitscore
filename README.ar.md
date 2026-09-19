<div align="center" dir="rtl">

# 🔍 commit-lens

**أداة ذكية لتحليل وقياس جودة رسائل الـ Git Commits ورفع مستواها الاحترافي.**  
_لأن سجل الـ Git النظيف يصنع فرق برمجية ناجحة._

[![npm version](https://img.shields.io/npm/v/commitscore.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/commitscore)
[![build](https://img.shields.io/github/actions/workflow/status/moustafagebreel/commit-lens/test.yml?branch=main&style=flat-square)](https://github.com/moustafagebreel/commit-lens/actions)
[![license](https://img.shields.io/github/license/moustafagebreel/commit-lens.svg?style=flat-square)](LICENSE)
[![node](https://img.shields.io/node/v/commitscore.svg?style=flat-square)](package.json)

[English](README.md) • [العربية](README.ar.md)

</div>

---

## ⚡ نظرة عامة

كثير من المطورين يكتبون رسائل commits مبهمة أو سريعة مثل `"fix"` أو `"wip"` أو `"update stuff"`. بمرور الوقت، يتحول تاريخ المستودع إلى صندوق أسود يستحيل فهم أسباب التعديلات البرمجية فيه دون قضاء ساعات في مراجعة الأكواد سطرًا بسطر.

**commit-lens** (`commitscore`) هي أداة CLI مفتوحة المصدر تقوم بفحص سجل المستودع، وتقييم جودة الـ commits بنقاط من **100**، وتوضيح نقاط الضعف وتقديم اقتراحات فورية للتحسين. تتكامل الأداة بسلاسة مع سطر الأوامر اليومي، وخطافات Git (Pre-commit hooks)، ومسارات الـ CI/CD.

```
┌────────────────────────────────────────────────────────┐
│  COMMIT LENS - تحليل جودة الـ Commits                  │
│  الفرع: main  |  الإجمالي: 100 commit  |  المحلل: 94  │
│                                                        │
│  التقييم: 88/100 🟡 جيد جداً                            │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 البدء السريع

### التثبيت

تثبيت الأداة عالمياً عبر npm:

```bash
npm install -g commitscore
```

أو تشغيلها مباشرة دون تثبيت عبر `npx`:

```bash
npx commitscore
```

### الأوامر الأساسية

```bash
# تحليل آخر 100 commit على الفرع الحالي
commit-lens analyze

# فحص الجودة في بيئات الـ CI/CD (مع exit code مناسب)
commit-lens check --min-score 70 --fail-on 60

# اقتراح بدائل ذكية وتصحيح آخر commit تلقائياً
commit-lens fix --apply

# تثبيت Git hook للفحص التلقائي قبل اعتماد الكوميت
commit-lens install-hook

# إنشاء ملف إعدادات .commit-lensrc.json مخصص
commit-lens init
```

---

## 📊 محرك التقييم والقواعد (Scoring Engine)

تخضع كل رسالة كوميت لفحص دقيق عبر 7 قواعد متخصصة بمجموع **100 نقطة**:

| القاعدة              |  الوزن  | الوصف                                        | معيار النجاح                                    |
| :------------------- | :-----: | :------------------------------------------- | :---------------------------------------------- |
| **`conventional`**   | **25%** | التحقق من معيار Conventional Commits القياسي | `type(scope): description`                      |
| **`spam`**           | **20%** | كشف الكلمات المبهمة والرسائل الكسولة         | خلو الرسالة من `"wip"` و `"fix"` و `"stuff"`    |
| **`length`**         | **15%** | فحص طول عنوان الرسالة                        | بين 10 و 72 حرفًا                               |
| **`language`**       | **15%** | التأكد من سلامة لغة الكتابة                  | لغة واضحة بالإنجليزية أو العربية (دون خلط مشوش) |
| **`scope`**          | **10%** | وضوح نطاق التعديل في كوميتات `feat` و `fix`  | تحديد الموديول بين قوسين `feat(auth): ...`      |
| **`imperative`**     | **10%** | استخدام صيغة الأمر للفعل الأول               | استخدام `"add"` وليس `"added"` أو `"adds"`      |
| **`capitalization`** | **5%**  | الالتزام بحالة الأحرف القياسية               | بدء الوصف بحرف صغير وتجنب ALL CAPS              |

### مستويات التقييم

- **90 – 100** 🟢 **ممتاز (Excellent)**: سجل تاريخي فائق الاحترافية.
- **70 – 89** 🟡 **جيد (Good)**: رسائل منضبطة مع فرص طفيفة للتحسين.
- **50 – 69** 🟠 **مقبول (Fair)**: تحتوي على العديد من الرسائل المبهمة.
- **0 – 49** 🔴 **ضعيف (Poor)**: رسائل عشوائية تتطلب تدخلاً ومراجعة عاجلة.

> [!NOTE]
> يتم استبعاد كوميتات الدمج (`Merge branch...`) والتراجع (`Revert...`) والكوميت الافتتاحي للمستودع تلقائياً من احتساب الخصم.

---

## 🛠️ دليل الأوامر

### `commit-lens analyze [options]`

الأمر الرئيسي لتحليل المستودع وعرض تقرير تفصيلي مع الرسوم البيانية.

- `-l, --last <count>`: عدد الكوميتات المراد فحصها (افتراضي: `100`).
- `--since <date>`: فحص من تاريخ محدد.
- `--until <date>`: فحص حتى تاريخ محدد.
- `-b, --branch <name>`: فحص فرع معين.
- `-a, --author <email>`: تصفية حسب المؤلف.
- `-f, --format <type>`: نوع المخرجات (`text` أو `json`).
- `-e, --export <path>`: تصدير نتائج التحليل إلى ملف.

### `commit-lens check [options]`

مخصص لخوادم التكامل المستمر (CI). يرجع `exit code 1` في حال انخفاض الجودة عن المعدل المطلوب.

```bash
commit-lens check --min-score 70 --fail-on 60
```

### `commit-lens fix [options]`

يقترح 3 صياغات بديلة واحترافية للكوميت:

```bash
# استعراض البدائل لآخر كوميت
commit-lens fix

# اختيار البديل وتطبيقه مباشرة عبر git commit --amend
commit-lens fix --apply
```

### `commit-lens install-hook [--force]`

يثبت الخطاف البرمجي في `.git/hooks/` لفحص رسالة كل كوميت قبل كتابته.

- **سريع جداً**: ينتهي خلال أقل من 50 مللي ثانية.
- **آمن (Fail-open)**: لا يعطل عمل المطور مطلقاً في حال حدوث أي استثناء تقني غير متوقع.
- **تفاعلي**: يسأل المطور التأكيد في حال كانت الرسالة ضعيفة الجودة.

---

## ⚙️ ملف التهيأة (`.commit-lensrc.json`)

يمكن تخصيص أوزان القواعد والكلمات المحظورة عبر تشغيل `commit-lens init`:

```json
{
  "rules": {
    "length": { "enabled": true, "min": 10, "max": 72, "weight": 15 },
    "conventional": { "enabled": true, "weight": 25 },
    "spam": { "enabled": true, "words": ["wip", "fix", "update", "stuff"], "weight": 20 },
    "language": { "enabled": true, "preferred": ["en", "ar"], "weight": 15 },
    "scope": { "enabled": true, "weight": 10 },
    "imperative": { "enabled": true, "weight": 10 },
    "capitalization": { "enabled": true, "weight": 5 }
  },
  "scoring": {
    "passThreshold": 70,
    "failCI": 60
  }
}
```

---

## 📄 الترخيص

مرخص تحت رخصة MIT © [Moustafa Gebreel](https://moustafagebreel.online)
