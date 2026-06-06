# نشر على Vercel — خطوات إلزامية

## المشكلة الشائعة

إذا رفعت **ملفات HTML فقط** أو **yassin basa.rar** بدون المجلدات، البناء يفشل والموقع 404.

## يجب أن يكون على GitHub (مجلد bad-bad-boy)

```
api/
  index.js
  [...path].js
server/          (كل المجلد)
assets/          (كل المجلد)
admin/           (كل المجلد)
scripts/
  vercel-build.js
  check-github-ready.js
*.html           (في الجذر)
package.json
package-lock.json
vercel.json
.node-version
.env.example
.gitignore
```

## لا ترفع أبداً

- `.env` (فيه كلمة سر MongoDB!)
- `node_modules/`
- `public/` (يُنشأ أثناء البناء)
- `yassin basa.rar`
- `*.rar` / `*.zip`

## قبل الرفع (من جهازك)

```bash
npm run check:deploy
npm run build
```

يجب أن يظهر: `Vercel build OK`

## Vercel Dashboard

1. **Framework Preset:** Other
2. **لا تغيّر** Build Command أو Output Directory (موجودة في `vercel.json`)
3. **Environment Variables:**
   - `MONGODB_URI` = رابط Atlas مع اسم القاعدة `/parapharmasi`
4. **Redeploy** → Clear build cache

## بعد أول نشر ناجح

من جهازك (نفس MONGODB_URI):

```bash
npm run catalog:import
npm run seed:admin
```

## اختبار

- `https://موقعك.vercel.app/` → الصفحة الرئيسية
- `https://موقعك.vercel.app/api/products` → JSON

## إذا .env موجود على GitHub

1. احذفه من GitHub فوراً
2. غيّر كلمة سر MongoDB Atlas
3. أضف `MONGODB_URI` فقط في Vercel Environment Variables
