/* =====================================================================
   بيانات الموقع — عدّل هذا الملف فقط لتغيير:
   الكورسات (المواد) والترمات، الملفات، السلايد، هيئة التدريس، فريق العمل.
   * المواد مأخوذة من جدول الخطة الدراسية (الترم 1-1 … 4-2).
   * الملفات: ضع ملف PDF في المسار المكتوب في url (مثال: files/cs/algorithms-summary.pdf).
   * السلايد: إمّا مصفوفة slides (عنوان t + نقاط p)، أو url لملف PDF للسلايد.
   * أسماء الدكاترة والمعيدين هنا أسماء تجريبية — استبدلها بالأسماء الحقيقية.
   * staff -> teaches: أرقام (ids) المواد التي يدرّسها العضو، وهي تظهر تحت اسمه.
   ===================================================================== */
(function () {
  var GENERIC_TOPICS = ["مقدمة المادة وأهدافها", "المفاهيم الأساسية", "التطبيقات والأمثلة", "مراجعة وتمارين"];
  var ICON = { programming: "code", design: "design", data: "data", media: "media", security: "security", year1: "pc", year2: "tree", cs: "cs", ai: "ai", is: "is" };
  var LEVELS = { programming: "مبتدئ", design: "مبتدئ", data: "مبتدئ", media: "مبتدئ", security: "مبتدئ", year1: "مبتدئ", year2: "متوسط", cs: "متقدم", ai: "متقدم", is: "متقدم" };
  var PREFIX = { programming: "prog", design: "des", data: "dat", media: "med", security: "sec", year1: "y1", year2: "y2", cs: "cs", ai: "ai", is: "is" };

  /* يبني سلايد تجريبية من عناوين المحاضرات */
  function makeSlides(title, topics, part) {
    return [
      { cover: true, t: title, p: [part] },
      { t: "ماذا ستتعلم؟", p: topics },
    ]
      .concat(
        topics.map(function (t) {
          return { t: t, p: ["تعريف المفهوم وأهميته", "مثال تطبيقي خطوة بخطوة", "نقاط مهمة للمراجعة"] };
        })
      )
      .concat([{ t: "الخلاصة", p: ["راجع النقاط الأساسية", "حلّ التمارين المرفقة", "انتقل إلى المحاضرة التالية"] }]);
  }

  /* مادة: C(المجموعة, الاسم المختصر للملف, اسم المادة, [الوصف], [الساعات], [المواضيع], [المستوى], [الأيقونة]) */
  function C(page, slug, title, desc, hours, topics, level, icon) {
    topics = topics || GENERIC_TOPICS;
    var half = Math.ceil(topics.length / 2);
    return {
      id: PREFIX[page] + "-" + slug,
      group: page,
      title: title,
      desc: desc || "",
      hours: hours || null,
      icon: icon || ICON[page],
      level: level || LEVELS[page],
      topics: topics,
      files: [
        { title: "ملخص المحاضرات", type: "PDF", url: "files/" + page + "/" + slug + "-summary.pdf" },
        { title: "تمارين ونماذج امتحانات", type: "PDF", url: "files/" + page + "/" + slug + "-exercises.pdf" },
      ],
      slides: [
        { title: "سلايد المحاضرات — الجزء الأول", slides: makeSlides(title, topics.slice(0, half), "الجزء الأول") },
        { title: "سلايد المحاضرات — الجزء الثاني", slides: makeSlides(title, topics.slice(half), "الجزء الثاني") },
      ],
    };
  }

  /* ترم: T(عنوان الترم, [ مواد ]) */
  function T(title, courses) {
    return { title: title, courses: courses };
  }

  var pages = {
    programming: {
      icon: "code",
      label: "البرمجة",
      courses: [
        C("programming", "web", "تطوير واجهات الويب", "HTML • CSS • JavaScript", 15, ["أساسيات HTML", "تنسيق الصفحات بـ CSS", "JavaScript للمبتدئين", "مشروع ويب كامل"]),
        C("programming", "python", "بايثون للمبتدئين", "بناء البرامج من الصفر", 12, ["المتغيرات والأنواع", "الشروط والحلقات", "الدوال والمكتبات", "مشروع تطبيقي صغير"]),
        C("programming", "java", "مقدمة في لغة Java", "أساسيات البرمجة بلغة Java", 14, ["بنية البرنامج", "التحكم والحلقات", "الأصناف والكائنات", "مشروع صغير"]),
        C("programming", "django", "Django Framework", "بناء تطبيقات ويب بإطار Django", 16, ["أساسيات Django", "النماذج وقواعد البيانات", "القوالب والواجهات", "النشر والأمان"], "متوسط"),
        C("programming", "flutter", "تطوير تطبيقات الموبايل بـ Flutter", "ابنِ تطبيقات للأندرويد وiOS بكود واحد", 20, ["أساسيات Dart", "بناء الواجهات", "إدارة الحالة", "ربط التطبيق بالإنترنت"], "متوسط", "mobile"),
      ],
    },
    design: {
      icon: "design",
      label: "تصميم الجرافيك",
      courses: [
        C("design", "photoshop", "أساسيات Adobe Photoshop", "تعديل وتصميم الصور باحتراف", 8, ["واجهة البرنامج والطبقات", "التحديد والتعديل", "الألوان والفلاتر", "تصميم بوستر كامل"]),
        C("design", "illustrator", "Adobe Illustrator", "الرسم الاتجاهي وتصميم الشعارات", 10, ["أدوات الرسم", "الأشكال والمسارات", "تصميم شعار", "تجهيز الملفات للطباعة"], "متوسط"),
        C("design", "uiux", "تصميم واجهات المستخدم UI/UX", "من الفكرة إلى النموذج التفاعلي بـ Figma", 12, ["أساسيات تجربة المستخدم", "تخطيط الشاشات", "تصميم الواجهات", "النموذج التفاعلي"], "متوسط"),
        C("design", "design-basics", "أساسيات التصميم والألوان", "قواعد التكوين والألوان والخطوط", 6, ["عناصر التصميم", "نظرية الألوان", "الخطوط والنصوص", "التكوين والتوازن"]),
      ],
    },
    data: {
      icon: "data",
      label: "البيانات",
      courses: [
        C("data", "py-data", "تحليل البيانات باستخدام Python", "NumPy و Pandas من الصفر", 10, ["مكتبة NumPy", "مكتبة Pandas", "تنظيف البيانات", "الرسوم البيانية"], "متوسط"),
        C("data", "mysql", "MySQL من الصفر", "تصميم قواعد البيانات وكتابة الاستعلامات", 10, ["مفاهيم قواعد البيانات", "إنشاء الجداول", "الاستعلامات", "الربط بين الجداول"]),
        C("data", "excel", "Excel لتحليل البيانات", "الدوال والجداول المحورية", 8, ["الدوال الأساسية", "الجداول المحورية", "الرسوم البيانية", "لوحة معلومات"]),
        C("data", "powerbi", "Power BI ولوحات المعلومات", "عرض البيانات بصرياً واتخاذ القرار", 9, ["استيراد البيانات", "نمذجة البيانات", "التقارير والرسوم", "نشر لوحة معلومات"], "متوسط"),
      ],
    },
    media: {
      icon: "media",
      label: "المونتاج",
      courses: [
        C("media", "premiere", "مونتاج الفيديو باستخدام Premiere", "من القص إلى التصدير النهائي", 12, ["واجهة البرنامج", "القص والتركيب", "الصوت والمؤثرات", "التصدير"]),
        C("media", "aftereffects", "After Effects والموشن جرافيك", "تحريك النصوص والرسوم", 14, ["الطبقات والحركة", "تحريك النصوص", "المؤثرات البصرية", "مشروع موشن جرافيك"], "متوسط"),
        C("media", "content", "صناعة المحتوى المرئي", "التخطيط والتصوير والنشر", 6, ["الفكرة والسيناريو", "التصوير", "المونتاج السريع", "النشر والتحليل"]),
      ],
    },
    security: {
      icon: "security",
      label: "الأمن السيبراني",
      courses: [
        C("security", "sec-basics", "أساسيات الأمن السيبراني", "مفاهيم الحماية وأنواع التهديدات", 12, ["مفاهيم الأمن", "أنواع التهديدات", "أدوات الحماية", "السياسات والتوعية"]),
        C("security", "network-sec", "حماية الشبكات", "جدران الحماية وتأمين الأجهزة", 10, ["أساسيات الشبكات", "جدران الحماية", "تأمين الأجهزة", "المراقبة والتقارير"], "متوسط"),
        C("security", "ethical", "مدخل إلى اختبار الاختراق الأخلاقي", "منهجية اختبار الأمان بإذن وتوثيقه", 12, ["المنهجية والأخلاقيات", "جمع المعلومات", "تقييم الثغرات", "كتابة التقرير"], "متوسط"),
      ],
    },
    year1: {
      icon: "pc",
      label: "السنة الأولى",
      terms: [
        T("الترم الأول", [
          C("year1", "history", "تاريخ الحوسبة"),
          C("year1", "electronics", "الإلكترونيات"),
          C("year1", "math1", "رياضيات 1"),
          C("year1", "cs-basics", "أساسيات علوم الحاسب"),
          C("year1", "english", "اللغة الإنجليزية"),
          C("year1", "ethics", "الحاسبات والأخلاقيات"),
          C("year1", "scientific-thinking", "التفكير العلمي"),
        ]),
        T("الترم الثاني", [
          C("year1", "discrete", "الهياكل المتقطعة"),
          C("year1", "computer-laws", "قوانين الحاسبات"),
          C("year1", "math2", "رياضيات 2"),
          C("year1", "prob1", "احتمالات وإحصاء 1"),
          C("year1", "programming-basics", "أساسيات البرمجة"),
          C("year1", "tech-writing", "الكتابة التقنية"),
          C("year1", "org-behavior", "سلوكيات الهيئات"),
        ]),
      ],
    },
    year2: {
      icon: "tree",
      label: "السنة الثانية",
      terms: [
        T("الترم الأول", [
          C("year2", "logic-design", "التصميم المنطقي"),
          C("year2", "operations-research", "بحوث العمليات"),
          C("year2", "prob2", "احتمالات وإحصاء 2"),
          C("year2", "oop", "البرمجة الشيئية"),
          C("year2", "project-mgmt", "إدارة المشروعات"),
          C("year2", "networks1", "شبكات الحاسب 1"),
        ]),
        T("الترم الثاني", [
          C("year2", "databases", "قواعد البيانات"),
          C("year2", "physics", "الفيزياء"),
          C("year2", "parallel", "البرمجة المتوازية"),
          C("year2", "ds1", "هياكل البيانات 1"),
          C("year2", "web-tech", "تكنولوجيا الويب"),
          C("year2", "modeling", "النمذجة والمحاكاة"),
        ]),
      ],
    },
    cs: {
      icon: "cs",
      label: "علوم الحاسب",
      terms: [
        T("السنة الثالثة • الترم الأول", [
          C("cs", "se", "هندسة البرمجيات"),
          C("cs", "image-proc", "معالجة الصور"),
          C("cs", "ai", "الذكاء الاصطناعي"),
          C("cs", "ds2", "هياكل البيانات 2"),
          C("cs", "algorithms", "الخوارزميات"),
          C("cs", "os", "نظم التشغيل"),
        ]),
        T("السنة الثالثة • الترم الثاني", [
          C("cs", "comp-arch", "بنية وتنظيم الحاسبات"),
          C("cs", "field-training", "التدريب الميداني"),
          C("cs", "cryptography", "التشفير"),
          C("cs", "graphics", "الرسم بالحاسب"),
          C("cs", "pl-concepts", "مفاهيم لغات الحاسب"),
          C("cs", "visual-prog", "البرمجة المرئية"),
        ]),
        T("السنة الرابعة • الترم الأول", [
          C("cs", "theory", "نظرية الحاسبات"),
          C("cs", "ml", "تعلم الآلة"),
          C("cs", "knowledge-discovery", "اكتشاف المعرفة"),
          C("cs", "mobile", "برمجة الأجهزة المحمولة"),
          C("cs", "cloud", "الحوسبة السحابية"),
          C("cs", "grad1", "مشروع التخرج"),
        ]),
        T("السنة الرابعة • الترم الثاني", [
          C("cs", "compilers", "المترجمات"),
          C("cs", "fuzzy", "الحوسبة الضبابية"),
          C("cs", "vision", "الرؤية بالحاسب"),
          C("cs", "big-data", "معالجة البيانات الضخمة"),
          C("cs", "nlp", "معالجة اللغات الطبيعية"),
          C("cs", "grad2", "مشروع التخرج"),
        ]),
      ],
    },
    ai: {
      icon: "ai",
      label: "الذكاء الاصطناعي",
      terms: [
        T("الترم الأول", [
          C("ai", "ml", "تعلم الآلة", "مفاهيم وتطبيقات عملية", 10, ["التعلم الموجّه", "التعلم غير الموجّه", "تقييم النماذج", "تقليل الإفراط في التعلم"]),
          C("ai", "dl", "التعلم العميق", "الشبكات العصبية من الصفر", 12, ["الشبكات العصبية", "الانتشار الخلفي", "الشبكات الالتفافية", "الشبكات المتكررة"]),
        ]),
        T("الترم الثاني", [
          C("ai", "cv", "الرؤية الحاسوبية", "تحليل الصور والفيديو", 9, ["معالجة الصور", "اكتشاف الحواف والميزات", "تصنيف الصور", "اكتشاف الكائنات"]),
          C("ai", "nlp", "معالجة اللغات الطبيعية", "فهم النصوص العربية والإنجليزية", 8, ["معالجة النصوص", "تمثيل الكلمات", "نماذج اللغة", "تطبيقات على اللغة العربية"]),
        ]),
      ],
    },
    is: {
      icon: "is",
      label: "نظم المعلومات",
      terms: [
        T("السنة الثالثة • الترم الأول", [
          C("is", "microcontrollers", "المتحكمات الدقيقة"),
          C("is", "data-comm", "تراسل البيانات"),
          C("is", "signals", "الإشارات والنظم"),
          C("is", "field-training", "التدريب الميداني"),
          C("is", "algorithms", "الخوارزميات"),
          C("is", "os", "نظم التشغيل"),
        ]),
        T("السنة الثالثة • الترم الثاني", [
          C("is", "comp-arch", "بنية وتنظيم الحاسبات"),
          C("is", "graphics", "الرسم بالحاسب"),
          C("is", "cryptography", "التشفير"),
          C("is", "pattern1", "التعرف على الأنماط 1"),
          C("is", "dsp", "معالجة الإشارات الرقمية"),
          C("is", "networks2", "شبكات الحاسب 2"),
        ]),
        T("السنة الرابعة • الترم الأول", [
          C("is", "concurrent", "الحوسبة المتزامنة"),
          C("is", "grad1", "مشروع التخرج"),
          C("is", "embedded", "النظم المدمجة"),
          C("is", "pattern2", "التعرف على الأنماط 2"),
          C("is", "internet-protocols", "برمجة وبروتوكولات الإنترنت"),
          C("is", "network-security", "تأمين شبكات الحاسبات"),
        ]),
        T("السنة الرابعة • الترم الثاني", [
          C("is", "robotics", "الإنسان الآلي"),
          C("is", "grad2", "مشروع التخرج"),
          C("is", "multimedia-mining", "التنقيب في الوسائط المتعددة"),
          C("is", "speech", "معالجة الكلام"),
          C("is", "telecom", "تكنولوجيا الاتصالات"),
          C("is", "cybersecurity", "الأمن السيبراني"),
        ]),
      ],
    },
  };

  /* يجمع مواد كل الترمات في page.courses ويضيف اسم الترم لكل مادة */
  Object.keys(pages).forEach(function (k) {
    var p = pages[k];
    if (!p.terms) return;
    p.courses = [];
    p.terms.forEach(function (t) {
      t.courses.forEach(function (c) {
        c.term = t.title;
        if (!c.desc) c.desc = p.label + " • " + t.title;
        p.courses.push(c);
      });
    });
  });

  window.AHLIA_DATA = {
    pages: pages,

    /* ---------------- الأفلام التقنية (movies.html) ----------------
       video: ضع رابط مصدر مرخّص أو ملفك أنت (يوتيوب/Vimeo أو ملف mp4) ليظهر زر «شاهد» */
    movies: {
      "sections": [
        {
          "id": "movies",
          "title": "أفلام الهكر والتكنولوجيا"
        },
        {
          "id": "series",
          "title": "مسلسلات البرمجة والكمبيوتر"
        },
        {
          "id": "documentaries",
          "title": "وثائقيات التكنولوجيا والإنترنت"
        },
        {
          "id": "cybersecurity",
          "title": "أفلام الأمن السيبراني"
        }
      ],
      "items": [
        {
          "id": "m1",
          "section": "movies",
          "kind": "فيلم",
          "title": "The Social Network",
          "desc": "فيلم درامي يروي قصة تأسيس فيسبوك من منظور طلابي تقني، يظهر التحديات البرمجية والاجتماعية والقانونية التي واجهها مارك زوكربيرج.",
          "details": "فيلم درامي يروي قصة تأسيس فيسبوك من منظور طلابي تقني، يظهر التحديات البرمجية والاجتماعية والقانونية التي واجهها مارك زوكربيرج أثناء تطوير المنصة التي غيرت عالم التواصل الاجتماعي. الفيلم يسلط الضوء على كيفية تحويل فكرة بسيطة إلى منصة غيرت طريقة تواصل البشر حول العالم.",
          "year": 2010,
          "duration": "120 دقيقة",
          "category": "internet",
          "categoryLabel": "الإنترنت",
          "poster": "https://m.media-amazon.com/images/M/MV5BOGUyZDUxZjEtMmIzMC00MzlmLTg4MGItZWJmMzBhZjE0Mjc1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
          "video": "",
          "rating": 4.2,
          "ratingCount": 1250,
          "director": "ديفيد فينشر",
          "language": "الإنجليزية",
          "tags": [
            "PHP",
            "MySQL",
            "خوادم الويب",
            "التواصل الاجتماعي"
          ]
        },
        {
          "id": "m2",
          "section": "movies",
          "kind": "فيلم",
          "title": "Hackers",
          "desc": "فيلم كلاسيكي عن ثقافة الهاكرز في التسعينيات، يظهر مجموعة من القراصنة المراهقين الموهوبين الذين يستخدمون مهاراتهم البرمجية.",
          "details": "فيلم كلاسيكي عن ثقافة الهاكرز في التسعينيات، يظهر مجموعة من القراصنة المراهقين الموهوبين الذين يستخدمون مهاراتهم البرمجية لاكتشاف مؤامرة خبيثة تهدد الأمن العالمي. الفيلم يعكس ثقافة الهاكرز في بدايات الإنترنت ويظهر كيفية استخدام المعرفة التقنية للتأثير على العالم.",
          "year": 1995,
          "duration": "107 دقيقة",
          "category": "hacking",
          "categoryLabel": "الهكر والأمن",
          "poster": "https://m.media-amazon.com/images/M/MV5BNmExMTkyYjItZTg0YS00NWYzLTkwMjItZWJiOWQ2M2ZkYjE4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
          "video": "",
          "rating": 3.8,
          "ratingCount": 890,
          "director": "إيان سوفتلي",
          "language": "الإنجليزية",
          "tags": [
            "C Programming",
            "Networking",
            "Unix",
            "Security"
          ]
        },
        {
          "id": "m3",
          "section": "movies",
          "kind": "فيلم",
          "title": "The Imitation Game",
          "desc": "فيلم سيرة ذاتية عن عالم الرياضيات آلان تورينج، أبو الذكاء الاصطناعي، وجهوده في فك شفرة آلة إنيغما الألمانية.",
          "details": "فيلم سيرة ذاتية عن عالم الرياضيات آلان تورينج، أبو الذكاء الاصطناعي، وجهوده في فك شفرة آلة إنيغما الألمانية خلال الحرب العالمية الثانية باستخدام آلة حاسوبية مبكرة. الفيلم يسلط الضوء على مساهمات تورينج في مجال الحوسبة ونظرية الذكاء الاصطناعي.",
          "year": 2014,
          "duration": "114 دقيقة",
          "category": "programming",
          "categoryLabel": "البرمجة",
          "poster": "https://m.media-amazon.com/images/M/MV5BOTgwMzFiMWYtZDhlNS00ODNkLWJiODAtZDVhNzgyNzJhYjQ4L2ltYWdlXkEyXkFqcGdeQXVyNzEzOTYxNTQ@._V1_.jpg",
          "video": "",
          "rating": 4.5,
          "ratingCount": 2100,
          "director": "مورتن تيلدوم",
          "language": "الإنجليزية",
          "tags": [
            "التشفير",
            "آلة تورينج",
            "خوارزميات",
            "الحوسبة"
          ]
        },
        {
          "id": "m4",
          "section": "movies",
          "kind": "فيلم",
          "title": "WarGames",
          "desc": "فيلم تشويق تقني كلاسيكي عن مراهق موهوب في البرمجة يخترق نظام كمبيوتر عسكري أمريكي ويعتقد أنه يلعب لعبة حرب.",
          "details": "فيلم تشويق تقني كلاسيكي عن مراهق موهوب في البرمجة يخترق نظام كمبيوتر عسكري أمريكي ويعتقد أنه يلعب لعبة حرب، لكنه يجد نفسه على شفا حرب نووية عالمية. الفيلم يعكس المخاوف المبكرة من الذكاء الاصطناعي والأمن السيبراني.",
          "year": 1983,
          "duration": "114 دقيقة",
          "category": "hacking",
          "categoryLabel": "الهكر والأمن",
          "poster": "https://upload.wikimedia.org/wikipedia/en/2/29/Wargames.jpg",
          "video": "",
          "rating": 4,
          "ratingCount": 760,
          "director": "جون بادهام",
          "language": "الإنجليزية",
          "tags": [
            "الوصول عن بعد",
            "المحاكاة",
            "أنظمة الدفاع",
            "الأمن"
          ]
        },
        {
          "id": "m5",
          "section": "movies",
          "kind": "فيلم",
          "title": "The Matrix",
          "desc": "فيلم خيال علمي ثوري يتبع قصة مبرمج كمبيوتر يكتشف أن العالم الذي يعيش فيه هو محاكاة حاسوبية متطورة.",
          "details": "فيلم خيال علمي ثوري يتبع قصة مبرمج كمبيوتر يكتشف أن العالم الذي يعيش فيه هو محاكاة حاسوبية متطورة، ويجد نفسه في قلب حرب بين البشر والذكاء الاصطناعي. الفيلم يطرح أسئلة فلسفية عميقة حول الواقع والحرية والتكنولوجيا.",
          "year": 1999,
          "duration": "136 دقيقة",
          "category": "ai",
          "categoryLabel": "الذكاء الاصطناعي",
          "poster": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
          "video": "",
          "rating": 4.7,
          "ratingCount": 3500,
          "director": "الأختان واتشوسكي",
          "language": "الإنجليزية",
          "tags": [
            "الذكاء الاصطناعي",
            "المحاكاة",
            "الواقع الافتراضي",
            "الخيال العلمي"
          ]
        },
        {
          "id": "s1",
          "section": "series",
          "kind": "مسلسل",
          "title": "Mr. Robot",
          "desc": "مسلسل درامي تقني يتبع قصة إليوت ألديرسون، مهندس أمن معلومات يعاني من القلق الاجتماعي.",
          "details": "مسلسل درامي تقني يتبع قصة إليوت ألديرسون، مهندس أمن معلومات يعاني من القلق الاجتماعي، ينضم إلى مجموعة قراصنة أناركيين تهدف إلى إسقاط أكبر conglomerate في العالم. المسلسل يقدم تصويرًا واقعيًا للقرصنة والأمن السيبراني.",
          "year": 2015,
          "duration": "4 مواسم",
          "category": "hacking",
          "categoryLabel": "الهكر والأمن",
          "poster": "https://m.media-amazon.com/images/M/MV5BMzgxMmQxZjQtNDdmMC00MjRlLTk1MDEtZDcwNTdmOTg0YzA2XkEyXkFqcGdeQXVyMzQ2MDI5NjU@._V1_.jpg",
          "video": "",
          "rating": 4.8,
          "ratingCount": 3200,
          "director": "سام إسماعيل",
          "language": "الإنجليزية",
          "tags": [
            "Linux",
            "Python",
            "Networking",
            "Security",
            "Ethical Hacking"
          ]
        },
        {
          "id": "d2",
          "section": "documentaries",
          "kind": "وثائقي",
          "title": "The Great Hack",
          "desc": "وثائقي استقصائي يفحم فضيحة كامبريدج أناليتيكا واستخدام بيانات فيسبوك.",
          "details": "وثائقي استقصائي يفحم فضيحة كامبريدج أناليتيكا وكيف تم استخدام بيانات فيسبوك الشخصية للتأثير على الانتخابات واستفتاءات حول العالم من خلال استهداف ناخبين محددين. الوثائقي يكشف عن الثغرات في حماية البيانات الشخصية.",
          "year": 2019,
          "duration": "114 دقيقة",
          "category": "hacking",
          "categoryLabel": "الهكر والأمن",
          "poster": "https://upload.wikimedia.org/wikipedia/ar/f/f8/%D8%A7%D9%84%D8%A7%D8%AE%D8%AA%D8%B1%D8%A7%D9%82_%D8%A7%D9%84%D9%83%D8%A8%D9%8A%D8%B1.jpeg",
          "video": "",
          "rating": 3.9,
          "ratingCount": 820,
          "director": "كاراه كوزيما وجيهن نوفاك",
          "language": "الإنجليزية",
          "tags": [
            "تحليل البيانات",
            "الخصوصية",
            "الإعلانات",
            "التأثير"
          ]
        },
        {
          "id": "d5",
          "section": "documentaries",
          "kind": "وثائقي",
          "title": "الانترنت المظلم و القراصنة",
          "desc": "وثائقيات :(الانترنت و الهاكرز)أخطر فلم وثائقي ممكن ان تراه",
          "details": "وثائقيات :(الانترنت و الهاكرز)أخطر فلم وثائقي ممكن ان تراه عن الانترنت المظلم و القراصنة ......",
          "year": 2015,
          "duration": "52 دقيقة",
          "category": "programming",
          "categoryLabel": "البرمجة",
          "poster": "cc.jpeg",
          "video": "",
          "rating": 4,
          "ratingCount": 380,
          "director": "-",
          "language": "العربية",
          "tags": [
            "تطوير البرمجيات",
            "حل المشكلات",
            "الابتكار",
            "التأثير المجتمعي"
          ]
        },
        {
          "id": "d6",
          "section": "documentaries",
          "kind": "وثائقي",
          "title": "خفايا عالم صناعة أجهزة الرقابة والتجسس",
          "desc": "تحقيقات الجزيرة | يكشف الوثائقي  تجار التجسس ",
          "details": "ولجت وحدة التحقيقات بشبكة الجزيرة عالم صناعة أجهزة الرقابة والتجسس، حيث يكشف فيلم “تجار التجسس” عن معدات تجسس شديدة الاختراق، وصفقات تجسس غير قانونية بملايين الدولارات تمثل انتهاكا للقوانين الدولية.",
          "year": 2017,
          "duration": "47 دقيقة",
          "category": "programming",
          "categoryLabel": "البرمجة",
          "poster": "aa.jpeg",
          "video": "",
          "rating": 4,
          "ratingCount": 380,
          "director": "-",
          "language": "العربية",
          "tags": [
            "تطوير البرمجيات",
            "حل المشكلات",
            "الابتكار",
            "التأثير المجتمعي"
          ]
        },
        {
          "id": "c1",
          "section": "cybersecurity",
          "kind": "فيلم",
          "title": "Blackhat",
          "desc": "فيلم تشويق تقني عن هاكر مفرج عنه من السجن للعمل مع السلطات.",
          "details": "فيلم تشويق تقني عن هاكر مفرج عنه من السجن للعمل مع السلطات لمطاردة قرصان خطير يقف وراء هجمات إلكترونية متطورة تهدد البنية التحتية الحيوية حول العالم. الفيلم يسلط الضوء على التحديات الأمنية في العصر الرقمي.",
          "year": 2015,
          "duration": "133 دقيقة",
          "category": "cybersecurity",
          "categoryLabel": "الأمن السيبراني",
          "poster": "https://upload.wikimedia.org/wikipedia/ar/7/79/Blackhat.jpg",
          "video": "",
          "rating": 3.5,
          "ratingCount": 720,
          "director": "مايكل مان",
          "language": "الإنجليزية",
          "tags": [
            "القرصنة",
            "الأمن السيبراني",
            "التحقيقات",
            "البنية التحتية"
          ]
        },
        {
          "id": "c2",
          "section": "cybersecurity",
          "kind": "فيلم",
          "title": "Who Am I",
          "desc": "فيلم تشويق ألماني عن شاب موهوب في البرمجة ينضم إلى مجموعة قرصنة.",
          "details": "فيلم تشويق ألماني عن شاب موهوب في البرمجة ينضم إلى مجموعة قرصنة ويصبح مشهورًا في المجتمع السري للهاكرز، لكنه يواجه معضلات أخلاقية عندما تتصاعد الأمور. الفيلم يستكشف ثقافة الهاكرز والأخلاقيات في العالم الرقمي.",
          "year": 2014,
          "duration": "102 دقيقة",
          "category": "cybersecurity",
          "categoryLabel": "الأمن السيبراني",
          "poster": "Who Am I.jpg",
          "video": "",
          "rating": 4.3,
          "ratingCount": 1100,
          "director": "باران بو أودار",
          "language": "الألمانية",
          "tags": [
            "ثقافة الهاكرز",
            "الأمن المعلوماتي",
            "البرمجة",
            "الأخلاقيات"
          ]
        }
      ]
    },

    /* ---------------- المسارات المهنية (paths.html) ----------------
       steps: ids المواد بالترتيب | advice: نصائح خبراء (اختياري) [{name, role, text}] */
    paths: [
      {
        "id": "web",
        "title": "مطوّر ويب",
        "desc": "من أساسيات البرمجة حتى بناء موقع كامل بقاعدة بيانات.",
        "icon": "code",
        "steps": [
          "y1-programming-basics",
          "prog-web",
          "dat-mysql",
          "prog-django",
          "des-uiux"
        ],
        "advice": []
      },
      {
        "id": "mobile",
        "title": "مطوّر تطبيقات الموبايل",
        "desc": "ابنِ تطبيقات للأندرويد وiOS بداية من أساسيات الكائنات.",
        "icon": "mobile",
        "steps": [
          "y1-programming-basics",
          "y2-oop",
          "prog-java",
          "prog-flutter",
          "des-uiux"
        ],
        "advice": []
      },
      {
        "id": "data",
        "title": "محلل بيانات",
        "desc": "اجمع البيانات ونظّفها وحلّلها واعرضها في لوحات معلومات.",
        "icon": "data",
        "steps": [
          "dat-excel",
          "dat-mysql",
          "prog-python",
          "dat-py-data",
          "dat-powerbi"
        ],
        "advice": []
      },
      {
        "id": "ai",
        "title": "مهندس ذكاء اصطناعي",
        "desc": "ابدأ ببايثون والبيانات ثم تعلم الآلة والتعلم العميق.",
        "icon": "ai",
        "steps": [
          "prog-python",
          "dat-py-data",
          "ai-ml",
          "ai-dl",
          "ai-nlp"
        ],
        "advice": []
      },
      {
        "id": "design",
        "title": "مصمم جرافيك وواجهات",
        "desc": "من أساسيات التصميم إلى الهوية البصرية وواجهات المستخدم.",
        "icon": "design",
        "steps": [
          "des-design-basics",
          "des-photoshop",
          "des-illustrator",
          "des-uiux"
        ],
        "advice": []
      },
      {
        "id": "media",
        "title": "مونتير وصانع محتوى",
        "desc": "خطّط للمحتوى وصوّره وأنتجه ثم أضف الحركة والمؤثرات.",
        "icon": "media",
        "steps": [
          "des-design-basics",
          "med-content",
          "med-premiere",
          "med-aftereffects"
        ],
        "advice": []
      },
      {
        "id": "security",
        "title": "متخصص أمن سيبراني",
        "desc": "ابدأ بالشبكات ثم مفاهيم الأمن وحماية الشبكات والتشفير.",
        "icon": "security",
        "steps": [
          "y2-networks1",
          "sec-sec-basics",
          "sec-network-sec",
          "is-cryptography",
          "is-cybersecurity"
        ],
        "advice": []
      },
      {
        "id": "network",
        "title": "مهندس شبكات",
        "desc": "من شبكات الحاسب إلى تأمينها وتكنولوجيا الاتصالات.",
        "icon": "is",
        "steps": [
          "y2-networks1",
          "is-networks2",
          "sec-network-sec",
          "is-network-security",
          "is-telecom"
        ],
        "advice": []
      }
    ],

    /* ---------------- إعلانات المنصة (صفحة الترحيب) ---------------- */
    announcements: [
      {
        "id": "a1",
        "title": "مرحباً بك في أهلية أكاديمي",
        "text": "كل موادك من السنة الأولى حتى التخصص، بملفات وسلايد، في مكان واحد.",
        "tag": "المنصة"
      },
      {
        "id": "a2",
        "title": "جدولي: نظّم مواعيدك",
        "text": "أضف محاضراتك وسكاشنك وتسليماتك في جدول أسبوعي واحد، وشاهد مواعيد اليوم فور دخولك.",
        "tag": "ميزة جديدة"
      },
      {
        "id": "a3",
        "title": "اشترك في الكورسات وتابع تقدمك",
        "text": "من صفحة أي مادة اضغط «اشترك»، ثم تابع المحاضرات المكتملة من «كورساتي» واحصل على شهادة عند الإتمام.",
        "tag": "ميزة جديدة"
      },
      {
        "id": "a4",
        "title": "كورسات مهارية جديدة",
        "text": "أضفنا كورسات في البرمجة وتصميم الجرافيك والبيانات والمونتاج والأمن السيبراني.",
        "tag": "محتوى"
      }
    ],

    /* ---------------- نتائج استبيان الطلاب (الصفحة الرئيسية) ---------------- */
    survey: [
      {
        "q": "إيه المشاكل اللي بتواجه الطلبة في الدراسة؟",
        "answers": [
          {
            "t": "سوء الإدارة والتنظيم والعشوائية بين المواعيد",
            "p": 90
          },
          {
            "t": "مفيش تكيفات",
            "p": 5
          },
          {
            "t": "مفيش مشاكل",
            "p": 5
          }
        ],
        "built": "جدولي لتنظيم المواعيد في مكان واحد، وكل مادة مرتبة حسب السنة والترم والتخصص.",
        "link": "schedule.html",
        "linkText": "افتح جدولي"
      },
      {
        "q": "إيه اللي متوقعه من المنصة؟",
        "answers": [
          {
            "t": "تسهيل العملية بشكل أفضل",
            "p": 70
          },
          {
            "t": "حاجة تنظم العملية الدراسية مش ألف جروب وألف رسالة وكل جروب محتوى",
            "p": 35
          },
          {
            "t": "إضافة خانة الكورسات التي يمكن الاشتراك بها",
            "p": 5
          }
        ],
        "built": "المحتوى كله في منصة واحدة بدل الجروبات، مع الاشتراك في الكورسات ومتابعتها من «كورساتي».",
        "link": "mylearning.html",
        "linkText": "كورساتي"
      },
      {
        "q": "شايف المنصة ممكن تستفيد منها؟",
        "answers": [
          {
            "t": "نعم",
            "p": 100
          },
          {
            "t": "لا",
            "p": 0
          }
        ],
        "built": "",
        "link": "",
        "linkText": ""
      },
      {
        "q": "إيه الحاجات اللي مش حابب تكون في المنصة؟",
        "answers": [
          {
            "t": "الصعوبة بين التنقل والبطء بشكل عام",
            "p": 70
          },
          {
            "t": "إنها تكون زي أي منصة مفيهاش فكرة",
            "p": 20
          },
          {
            "t": "مفيش حاجة",
            "p": 10
          }
        ],
        "built": "صفحات خفيفة وسريعة، وقائمة واضحة، وبحث وتصفية في الكورسات، وأفلام ومسارات تميّز المنصة.",
        "link": "courses.html",
        "linkText": "جميع الكورسات"
      },
      {
        "q": "إيه الحاجات اللي محتاج ليها في المنصة في سوق العمل والكورسات؟",
        "answers": [
          {
            "t": "مكان أقدر آخد كورسات منه وكورسات للأقسام",
            "p": 50
          },
          {
            "t": "ناس خبرة تكون أخدت كورسات معينة واشتغلت أو بتنصح بكورسات معينة حسب طبيعة شغلها وكل قسم له كورساته",
            "p": 50
          }
        ],
        "built": "كورسات مهارية لكل مجال، ومسارات مهنية مقترحة لكل قسم يمكن إضافة نصائح الخبراء إليها.",
        "link": "paths.html",
        "linkText": "المسارات المهنية"
      },
      {
        "q": "أي اقتراحات تفيد في تطوير المنصة؟",
        "answers": [
          {
            "t": "يبقى عليها نتائج أعمال السنة أول بأول وكل حاجة محتاجها في التخصص تبقى موجودة ومفيش لخبطة ولا أقدر أخش على تخصص مش مسجله",
            "p": 50
          },
          {
            "t": "إنها تكون ويب وأبلكيشن في نفس الوقت",
            "p": 40
          },
          {
            "t": "إشعارات الرسائل",
            "p": 10
          }
        ],
        "built": "كل طالب يفتح سنته وتخصصه فقط، والمنصة تعمل كتطبيق قابل للتثبيت، وإعلانات المنصة تظهر في صفحة الترحيب.",
        "link": "",
        "linkText": ""
      }
    ],
/* ---------------- هيئة التدريس (دكاترة ومعيدين) ----------------
   type: "doctor" أو "assistant" | teaches: ids المواد التي يدرّسها */
staff: [
  {"name": "سامح محمد مصطفى سيد", "title": "مدرس", "type": "doctor", "teaches": ["y1-history", "y1-cs-basics", "y1-scientific-thinking", "y1-math2", "y1-tech-writing"]},
  {"name": "احمد عطيتو عبد العاطى الحداد", "title": "مدرس", "type": "doctor", "teaches": ["y1-electronics", "y1-english", "y1-discrete", "y1-prob1", "y1-org-behavior"]},
  {"name": "د. احمد العربي", "title": "أستاذ دكتور", "type": "doctor", "teaches": ["y1-math1", "y1-ethics", "y1-computer-laws", "y1-programming-basics"]},
  {"name": "أ.د.م/ محمود حسب الله محمود علي", "title": "أستاذ دكتور", "type": "doctor", "teaches": ["y1-history", "y1-math1", "y1-english", "y1-scientific-thinking", "y1-computer-laws", "y1-prob1", "y1-tech-writing"]},
  {"name": "نهلة فتحى احمد عمران", "title": "مدرس مساعد", "type": "assistant", "teaches": ["y1-electronics", "y1-cs-basics", "y1-ethics", "y1-discrete", "y1-math2", "y1-programming-basics", "y1-org-behavior"]},
  {"name": "همام عبد العال همام الشاذلى", "title": "معيد", "type": "assistant", "teaches": ["y2-logic-design", "y2-prob2", "y2-project-mgmt", "y2-databases", "y2-parallel", "y2-web-tech"]},
  {"name": "بسمه احمد عبد الحافظ خلف الله", "title": "معيد", "type": "assistant", "teaches": ["y2-operations-research", "y2-oop", "y2-networks1", "y2-physics", "y2-ds1", "y2-modeling"]},
  {"name": "عبده مكى موسى حسين", "title": "مدرس مساعد", "type": "assistant", "teaches": ["y2-logic-design", "y2-prob2", "y2-project-mgmt", "y2-databases", "y2-parallel", "y2-web-tech"]},
  {"name": "ندا مبارك أحمد مبارك", "title": "معيد", "type": "assistant", "teaches": ["y2-operations-research", "y2-oop", "y2-networks1", "y2-physics", "y2-ds1", "y2-modeling"]},
  {"name": "رضا محمد أحمد علي", "title": "مدرس", "type": "doctor", "teaches": ["cs-se", "cs-algorithms", "cs-cryptography", "cs-theory", "cs-cloud", "cs-vision"]},
  {"name": "هيلانه رافت تامر", "title": "أستاذ دكتور", "type": "doctor", "teaches": ["cs-image-proc", "cs-os", "cs-graphics", "cs-ml", "cs-grad1", "cs-big-data"]},
  {"name": "رندا محمد عبد الحميد محمد", "title": "أستاذ مساعد", "type": "doctor", "teaches": ["is-microcontrollers", "is-algorithms", "is-cryptography", "is-concurrent", "is-internet-protocols", "is-multimedia-mining"]},
  {"name": "نغم احمد عبد المجيد محمد", "title": "مدرس", "type": "doctor", "teaches": ["cs-ai", "cs-comp-arch", "cs-pl-concepts", "cs-knowledge-discovery", "cs-compilers", "cs-nlp"]},
  {"name": "عمرو مجدى ربيع", "title": "مدرس", "type": "doctor", "teaches": ["cs-ds2", "cs-field-training", "cs-visual-prog", "cs-mobile", "cs-fuzzy", "cs-grad2"]},
  {"name": "احمد حمادة محمد", "title": "معيد", "type": "assistant", "teaches": ["cs-se", "cs-ds2", "cs-comp-arch", "cs-graphics", "cs-theory", "cs-mobile", "cs-compilers", "cs-big-data"]},
  {"name": "امال احمد محمد راشد", "title": "مدرس مساعد", "type": "assistant", "teaches": ["cs-image-proc", "cs-algorithms", "cs-field-training", "cs-pl-concepts", "cs-ml", "cs-cloud", "cs-fuzzy", "cs-nlp"]},
  {"name": "أحمد فاروق متولى سالم", "title": "معيد", "type": "assistant", "teaches": ["cs-ai", "cs-os", "cs-cryptography", "cs-visual-prog", "cs-knowledge-discovery", "cs-grad1", "cs-vision", "cs-grad2"]},
  {"name": "عبدالرحمن عبدالنظير عبدالكريم محمود", "title": "أستاذ دكتور", "type": "doctor", "teaches": ["ai-ml", "ai-dl", "ai-cv", "ai-nlp"]},
  {"name": "سارة فراج عبد الغني", "title": "أستاذ مساعد", "type": "doctor", "teaches": ["ai-ml", "ai-dl", "ai-cv", "ai-nlp"]},
  {"name": "اسراء مختار محمد حامد", "title": "مدرس مساعد", "type": "assistant", "teaches": ["is-microcontrollers", "is-algorithms", "is-cryptography", "is-concurrent", "is-internet-protocols", "is-multimedia-mining"]},
  {"name": "يونس صلاح يونس عبدالوارث", "title": "مدرس", "type": "doctor", "teaches": ["is-data-comm", "is-os", "is-pattern1", "is-grad1", "is-network-security", "is-speech"]},
  {"name": "اماني اسعد عبدالسميع احمد", "title": "أستاذ دكتور", "type": "doctor", "teaches": ["is-signals", "is-comp-arch", "is-dsp", "is-embedded", "is-robotics", "is-telecom"]},
],

    /* ---------------- فريق العمل (صفحة team.html) ----------------
       كل فريق له قسم مستقل في الصفحة. لإضافة فريق جديد انسخ كتلة { id, title ... } كاملة.
       * icon: review | design | code | dev | mgmt   (الأيقونة بجانب عنوان الفريق)
       * members -> name: الاسم | role: الدور | photo: مسار الصورة داخل مجلد team/
         (لو الصورة غير موجودة يظهر حرف من الاسم)
       * linkedin / facebook: رابط الحساب الكامل — اتركه "" لو مفيش حساب (يظهر الزر معطّلاً) */
    teams: [
      {
        id: "review",
        title: "فريق المراجعة",
        desc: "مراجعة المحتوى والتأكد من دقته",
        icon: "review",
        members: [
          { name: "اسم العضو (1)", role: "مراجع محتوى", photo: "team/review-1.jpg", linkedin: "", facebook: "" },
          { name: "اسم العضو (2)", role: "مراجع محتوى", photo: "team/review-2.jpg", linkedin: "", facebook: "" },
        ],
      },
      {
        id: "design",
        title: "فريق التصميم",
        desc: "تصميم الواجهات وتجربة المستخدم",
        icon: "design",
        members: [
          { name: "اسم العضو (1)", role: "مصمم UI/UX", photo: "team/design-1.jpg", linkedin: "", facebook: "" },
          { name: "اسم العضو (2)", role: "مصمم UI/UX", photo: "team/design-2.jpg", linkedin: "", facebook: "" },
        ],
      },
      {
        id: "code",
        title: "فريق البرمجة",
        desc: "بناء الموقع وبرمجة صفحاته",
        icon: "code",
        members: [
          { name: "اسم العضو (1)", role: "مبرمج", photo: "team/code-1.jpg", linkedin: "", facebook: "" },
          { name: "اسم العضو (2)", role: "مبرمج", photo: "team/code-2.jpg", linkedin: "", facebook: "" },
        ],
      },
      {
        id: "dev",
        title: "فريق التطوير",
        desc: "تطوير المحتوى والميزات الجديدة",
        icon: "dev",
        members: [
          { name: "اسم العضو (1)", role: "مطوّر", photo: "team/dev-1.jpg", linkedin: "", facebook: "" },
          { name: "اسم العضو (2)", role: "مطوّر", photo: "team/dev-2.jpg", linkedin: "", facebook: "" },
        ],
      },
      {
        id: "mgmt",
        title: "فريق الإدارة",
        desc: "تنظيم العمل والتنسيق بين الفرق",
        icon: "mgmt",
        members: [
          { name: "اسم العضو (1)", role: "إدارة المشروع", photo: "team/mgmt-1.jpg", linkedin: "", facebook: "" },
          { name: "اسم العضو (2)", role: "إدارة المشروع", photo: "team/mgmt-2.jpg", linkedin: "", facebook: "" },
        ],
      },
    ],
  };
})();
