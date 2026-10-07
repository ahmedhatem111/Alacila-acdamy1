/* إعدادات الاتصال بقاعدة البيانات (Supabase).
   املأ القيمتين من: Supabase > Project Settings > API
   - supabaseUrl : Project URL  (مثال https://abcdxyz.supabase.co)
   - supabaseKey : مفتاح anon public  (آمن إنه يكون ظاهر في الموقع، الحماية بتتم بسياسات RLS في supabase.sql)
   لو سبتهم فاضيين الموقع هيحاول يكلّم سيرفر Flask على نفس الدومين (/api). */
window.AHLIA_CONFIG = {
  supabaseUrl: "",
  supabaseKey: "",
};
