export type Language = 'en' | 'th';

export interface Translations {
  // Start Menu
  programs: string;
  documents: string;
  settings: string;
  find: string;
  help: string;
  run: string;
  shutDown: string;
  start: string;
  // Settings submenu
  controlPanel: string;
  taskbarAndStartMenu: string;
  // Find submenu
  filesOrFolders: string;
  onTheInternet: string;
  // Documents submenu
  empty: string;
  // Desktop context menu
  arrangeIcons: string;
  refresh: string;
  newItem: string;
  properties: string;
  // Icon context menu
  open: string;
  rename: string;
  delete: string;
  // Tray
  languageLabel: string;
  // Mobile
  mobileWarning: string;
  // README
  readme: {
    title: string;
    p1: string;
    p2: string;
    p3: string;
    languages: string;
    frameworks: string;
    tools: string;
    platforms: string;
  };
  // CV
  cv: {
    tabs: {
      experience: string;
      education: string;
      skills: string;
      certificates: string;
    };
    saveAs: string;
    experiences: Array<{
      title: string;
      bullets: string[];
    }>;
    education: {
      degree: string;
      gpaLabel: string;
      langSection: string;
      langList: string[];
    };
    skills: Array<{
      category: string;
      items: string[];
    }>;
    certificates: string[];
  };
  // Projects
  projects: {
    toolbarPrefix: string;
    description: string;
    techStack: string;
    repository: string;
    viewOnGithub: string;
    privateInternal: string;
    screenshotsLabel: string;
    statusOf: string;
    statusProjects: string;
    prev: string;
    next: string;
    close: string;
    tapToClose: string;
    descriptions: Record<string, string>;
  };
  // Mail
  mail: {
    title: string;
    sent: string;
    sentSubtext: string;
    sendAnother: string;
    labelTo: string;
    labelName: string;
    labelEmail: string;
    labelSubject: string;
    labelMessage: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderSubject: string;
    placeholderMessage: string;
    errorMessage: string;
    sending: string;
    send: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    programs: 'Programs',
    documents: 'Documents',
    settings: 'Settings',
    find: 'Find',
    help: 'Help',
    run: 'Run...',
    shutDown: 'Shut Down...',
    start: 'Start',
    controlPanel: 'Control Panel',
    taskbarAndStartMenu: 'Taskbar & Start Menu...',
    filesOrFolders: 'Files or Folders...',
    onTheInternet: 'On the Internet...',
    empty: '(Empty)',
    arrangeIcons: 'Arrange Icons',
    refresh: 'Refresh',
    newItem: 'New',
    properties: 'Properties',
    open: 'Open',
    rename: 'Rename',
    delete: 'Delete',
    languageLabel: 'Language: English',
    mobileWarning: 'Best viewed on desktop for full experience',
    readme: {
      title: 'README.TXT',
      p1: 'Hi! I\'m <strong>Attidmese Bunsua (Zeyd)</strong>, a Software Engineer graduated from Mae Fah Luang University (GPA 3.29).',
      p2: 'I specialize in full-stack development and AI integration, with experience building ERP systems, chatbots, and AI-powered platforms.',
      p3: 'Double-click the icons on the desktop to explore my projects, send me mail, or play some games!',
      languages: 'Languages:',
      frameworks: 'Frameworks:',
      tools: 'Tools:',
      platforms: 'Platforms:',
    },
    cv: {
      tabs: {
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        certificates: 'Certificates',
      },
      saveAs: 'Save As...',
      experiences: [
        {
          title: 'Full-Stack Developer (Freelance)',
          bullets: [
            'Built QR-based Warranty Management Medical Equipments ERP using Vue.js, Node.js, MySQL',
            'Deployed as Electron desktop app, cut manual input by 50%',
            'PDF/QR generation and Google Calendar integration',
          ],
        },
        {
          title: 'AI Engineer (Intern)',
          bullets: [
            'Developed AI video/audio summarization platform using PyTorch, LangChain, FastAPI',
            'Built backend APIs and Vue.js dashboards with Supabase integration',
            'Enhanced UX with real-time previews, drag-drop uploads, and ASR benchmarking',
          ],
        },
        {
          title: 'IT Support & LINE Developer',
          bullets: [
            'Built LINE Chatbot automating medical equipment data retrieval',
            'Reduced manual data lookup by 80%, response times by 40%',
          ],
        },
      ],
      education: {
        degree: 'Bachelor of Software Engineering',
        gpaLabel: 'GPA:',
        langSection: 'LANGUAGES',
        langList: [
          'English — Intermediate (CEFR B1)',
          'Thai — Native',
        ],
      },
      skills: [
        { category: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
        { category: 'Frameworks', items: ['FastAPI', 'Flask', 'Vue.js', 'Express.js', 'PyTorch', 'LangChain'] },
        { category: 'Tools', items: ['Git', 'Docker', 'Electron', 'GitLab CI', 'Jest', 'LINE API', 'Cloudflare Tunnel'] },
        { category: 'Platforms', items: ['MySQL', 'MongoDB', 'Supabase', 'Google Cloud'] },
        { category: 'Soft Skills', items: ['Problem-Solving', 'Communication', 'Time Management', 'Adaptability', 'Team Collaboration'] },
      ],
      certificates: [
        'Artificial Intelligence Summer Program — Taiwan',
        'Foundations of Cybersecurity — Google',
        'Google AI Essentials — Google',
        'Prompt Engineering for ChatGPT — Vanderbilt University',
      ],
    },
    projects: {
      toolbarPrefix: 'Projects',
      description: 'DESCRIPTION',
      techStack: 'TECH STACK',
      repository: 'REPOSITORY',
      viewOnGithub: 'View on GitHub ↗',
      privateInternal: '🔒 Private / Internal',
      screenshotsLabel: 'SCREENSHOTS',
      statusOf: 'of',
      statusProjects: 'projects',
      prev: '⬅︎ Prev',
      next: 'Next ➡︎',
      close: '✕ Close',
      tapToClose: 'or tap outside to close',
      descriptions: {
        euroscan: 'QR-based warranty management ERP with PDF/QR generation, Google Calendar integration, deployed as Electron desktop app.',
        family: 'Production ERP for family food business  inventory, BOM recipes, finance (business vs personal wallets), iPad Kiosk, and mobile app.',
        portfolio: 'Windows 98-style interactive portfolio built as a fake OS with draggable windows, games, and apps.',
        'ai-job': 'AI-powered job matching for the Thailand market with NLP skill extraction and embeddings-based ranking.',
        stock: 'Real-time stock news analysis platform with AI impact scoring, delivered via LINE Mini App.',
      },
    },
    mail: {
      title: 'Send me a message!',
      sent: 'Message sent!',
      sentSubtext: "I'll get back to you soon.",
      sendAnother: 'Send another',
      labelTo: 'To:',
      labelName: 'Your Name: *',
      labelEmail: 'Your Email: *',
      labelSubject: 'Subject:',
      labelMessage: 'Message: *',
      placeholderName: 'Your name...',
      placeholderEmail: 'your@email.com',
      placeholderSubject: 'Your subject...',
      placeholderMessage: 'Write your message here...',
      errorMessage: '⚠ Failed to send. Please try again.',
      sending: 'Sending...',
      send: 'Send',
    },
  },
  th: {
    programs: 'โปรแกรม',
    documents: 'เอกสาร',
    settings: 'การตั้งค่า',
    find: 'ค้นหา',
    help: 'ความช่วยเหลือ',
    run: 'เรียกใช้...',
    shutDown: 'ปิดเครื่อง...',
    start: 'เริ่ม',
    controlPanel: 'แผงควบคุม',
    taskbarAndStartMenu: 'แถบงาน & เมนูเริ่มต้น...',
    filesOrFolders: 'ไฟล์หรือโฟลเดอร์...',
    onTheInternet: 'บนอินเทอร์เน็ต...',
    empty: '(ว่าง)',
    arrangeIcons: 'จัดเรียงไอคอน',
    refresh: 'รีเฟรช',
    newItem: 'ใหม่',
    properties: 'คุณสมบัติ',
    open: 'เปิด',
    rename: 'เปลี่ยนชื่อ',
    delete: 'ลบ',
    languageLabel: 'ภาษา: ไทย',
    mobileWarning: 'เปิดบนคอมพิวเตอร์เพื่อประสบการณ์การใช้งานที่ดีที่สุด',
    readme: {
      title: 'README.TXT',
      p1: 'สวัสดีครับ! ผม <strong>อัตติรมีซี บุญเสือ (เซด)</strong> เป็นวิศวกรซอฟต์แวร์ จบการศึกษาจากมหาวิทยาลัยแม่ฟ้าหลวง (เกรดเฉลี่ย 3.29)',
      p2: 'ผมมีความเชี่ยวชาญด้าน Full-stack development และการประยุกต์ใช้ AI มีประสบการณ์ในการพัฒนาระบบ ERP, แชทบอท และแพลตฟอร์มที่ขับเคลื่อนด้วย AI',
      p3: 'ดับเบิลคลิกที่ไอคอนบนหน้าจอเพื่อดูผลงาน ส่งอีเมล หรือเล่นเกมได้เลยครับ!',
      languages: 'ภาษาโปรแกรม:',
      frameworks: 'เฟรมเวิร์ก:',
      tools: 'เครื่องมือ:',
      platforms: 'แพลตฟอร์ม:',
    },
    cv: {
      tabs: {
        experience: 'ประสบการณ์',
        education: 'การศึกษา',
        skills: 'ทักษะ',
        certificates: 'ใบรับรอง',
      },
      saveAs: 'บันทึกเป็น...',
      experiences: [
        {
          title: 'Full-Stack Developer (Freelance)',
          bullets: [
            'พัฒนาระบบ ERP จัดการการรับประกันสินค้าทางการแพทย์แบบ QR ด้วย Vue.js, Node.js, MySQL',
            'Deploy เป็น Electron Desktop App  ลดการป้อนข้อมูลด้วยมือลง 50%',
            'สร้างระบบออก PDF/QR และ Integration กับ Google Calendar',
          ],
        },
        {
          title: 'AI Engineer (ฝึกงาน)',
          bullets: [
            'พัฒนา Platform สรุปวิดีโอ/เสียงด้วย AI โดยใช้ PyTorch, LangChain, FastAPI',
            'พัฒนา Backend API และ Dashboard ด้วย Vue.js พร้อม Supabase Integration',
            'ยกระดับ UX ด้วย Real-time Preview, Drag-and-Drop Upload และ ASR Benchmarking',
          ],
        },
        {
          title: 'IT Support & LINE Developer',
          bullets: [
            'พัฒนา LINE Chatbot สำหรับดึงข้อมูลอุปกรณ์ทางการแพทย์อัตโนมัติ',
            'ลดเวลาการค้นข้อมูลด้วยมือลง 80% และลดเวลาตอบสนองลง 40%',
          ],
        },
      ],
      education: {
        degree: 'วิศวกรรมศาสตรบัณฑิต สาขาวิศวกรรมซอฟต์แวร์',
        gpaLabel: 'เกรดเฉลี่ย:',
        langSection: 'ภาษา',
        langList: [
          'ภาษาอังกฤษ — ระดับกลาง (CEFR B1)',
          'ภาษาไทย — ภาษาแม่',
        ],
      },
      skills: [
        { category: 'ภาษาโปรแกรม', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
        { category: 'Frameworks', items: ['FastAPI', 'Flask', 'Vue.js', 'Express.js', 'PyTorch', 'LangChain'] },
        { category: 'Tools', items: ['Git', 'Docker', 'Electron', 'GitLab CI', 'Jest', 'LINE API', 'Cloudflare Tunnel'] },
        { category: 'Platforms', items: ['MySQL', 'MongoDB', 'Supabase', 'Google Cloud'] },
        { category: 'ทักษะด้านบุคคล', items: ['แก้ปัญหาเชิงตรรกะ', 'การสื่อสาร', 'การบริหารเวลา', 'ความยืดหยุ่น', 'การทำงานเป็นทีม'] },
      ],
      certificates: [
        'Artificial Intelligence Summer Program — Taiwan',
        'Foundations of Cybersecurity — Google',
        'Google AI Essentials — Google',
        'Prompt Engineering for ChatGPT — Vanderbilt University',
      ],
    },
    projects: {
      toolbarPrefix: 'โปรเจกต์',
      description: 'รายละเอียด',
      techStack: 'TECH STACK',
      repository: 'REPOSITORY',
      viewOnGithub: 'ดูบน GitHub ↗',
      privateInternal: '🔒 ส่วนตัว / ภายใน',
      screenshotsLabel: 'SCREENSHOTS',
      statusOf: 'จาก',
      statusProjects: 'โปรเจกต์',
      prev: '⬅︎ ก่อนหน้า',
      next: 'ถัดไป ➡︎',
      close: '✕ ปิด',
      tapToClose: 'หรือแตะด้านนอกเพื่อปิด',
      descriptions: {
        euroscan: 'ระบบ ERP จัดการการรับประกันสินค้าแบบ QR พร้อมสร้าง PDF/QR, Integration กับ Google Calendar และ Deploy เป็น Electron Desktop App',
        family: 'ระบบ ERP สำหรับธุรกิจอาหารในครอบครัว จัดการสต็อก, สูตรการผลิต BOM, การเงิน (กระเป๋าธุรกิจ vs ส่วนตัว), iPad Kiosk และ Mobile App',
        portfolio: 'Portfolio แบบ Interactive สไตล์ Windows 98 พัฒนาเป็น OS จำลอง มีหน้าต่างลากได้, เกม และแอปพลิเคชันต่าง ๆ',
        'ai-job': 'ระบบจับคู่งานด้วย AI สำหรับตลาดแรงงานไทย ด้วย NLP ดึงทักษะและ Embeddings-based Ranking',
        stock: 'Platform วิเคราะห์ข่าวหุ้น Real-time พร้อม AI Impact Scoring ส่งผ่าน LINE Mini App',
      },
    },
    mail: {
      title: 'ส่งข้อความหาผม!',
      sent: 'ส่งข้อความสำเร็จ!',
      sentSubtext: 'ผมจะติดต่อกลับหาคุณโดยเร็วที่สุดครับ',
      sendAnother: 'ส่งข้อความอีกครั้ง',
      labelTo: 'ถึง:',
      labelName: 'ชื่อของคุณ: *',
      labelEmail: 'อีเมลของคุณ: *',
      labelSubject: 'หัวเรื่อง:',
      labelMessage: 'ข้อความ: *',
      placeholderName: 'ชื่อของคุณ...',
      placeholderEmail: 'your@email.com',
      placeholderSubject: 'หัวเรื่อง...',
      placeholderMessage: 'เขียนข้อความของคุณที่นี่...',
      errorMessage: '⚠ ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      sending: 'กำลังส่ง...',
      send: 'ส่ง',
    },
  },
};
