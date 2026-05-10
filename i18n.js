const translations = {
  en: {
    privacyPolicyUrl: "privacy.html",
    balance: "Balance",
    income: "Income",
    outcome: "Outcome",
    dashboard: "Dashboard",
    expenses: "Expenses",
    all: "All",
    privacyPolicy: "Privacy Policy",
    cookieText: "This app uses localStorage to save your budget data on your device. No data is sent to any server. By continuing, you agree to our",
    cookieAccept: "Accept",
    cookieDecline: "Decline",
    titlePlaceholder: "title",
    amountPlaceholder: "$0",
    addExpenseLabel: "Add expense",
    addIncomeLabel: "Add income",
    alertEmptyTitle: "Please enter a title.",
    alertTitleLength: "Title must be 30 characters or less.",
    alertEmptyAmount: "Please enter an amount.",
    alertNegativeAmount: "Amount must be greater than 0.",
    alertMaxAmount: "Amount must not exceed 1,000,000.",
    alertDecimalAmount: "Amount must have at most 2 decimal places.",
  },
  zh: {
    privacyPolicyUrl: "privacy-zh.html",
    balance: "余额",
    income: "收入",
    outcome: "支出",
    dashboard: "账单",
    expenses: "支出",
    all: "全部",
    privacyPolicy: "隐私政策",
    cookieText: "本应用使用 localStorage 在您的设备上保存预算数据，数据不会发送到任何服务器。继续使用即表示您同意我们的",
    cookieAccept: "接受",
    cookieDecline: "拒绝",
    titlePlaceholder: "标题",
    amountPlaceholder: "$0",
    addExpenseLabel: "添加支出",
    addIncomeLabel: "添加收入",
    alertEmptyTitle: "请输入标题。",
    alertTitleLength: "标题不能超过30个字符。",
    alertEmptyAmount: "请输入金额。",
    alertNegativeAmount: "金额必须大于0。",
    alertMaxAmount: "金额不能超过1,000,000。",
    alertDecimalAmount: "金额最多保留两位小数。",
  }
};

let currentLang = localStorage.getItem("lang") || "en";

function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  const t = translations[lang];

  // UI文字
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });

  // placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) el.placeholder = t[key];
  });

  // aria-label
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    if (t[key]) el.setAttribute("aria-label", t[key]);
  });

  // cookie banner 特殊处理
  const cookieText = document.getElementById("cookie-text");
  if (cookieText) {
    cookieText.textContent = t.cookieText + " ";
  }

  // 语言按钮高亮
  document.getElementById("lang-en").classList.toggle("lang-active", lang === "en");
  document.getElementById("lang-zh").classList.toggle("lang-active", lang === "zh");

  // 切换 privacy policy 链接
  document.querySelectorAll("a[data-i18n-href]").forEach(el => {
    const key = el.getAttribute("data-i18n-href");
    if (t[key]) el.href = t[key];
  });
}

function getCurrentLang() {
  return currentLang;
}