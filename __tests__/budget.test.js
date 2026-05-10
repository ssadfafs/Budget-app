// __tests__/budget.test.js

function buildDOM() {
  document.body.innerHTML = `
    <div id="cookie-banner">
      <p><span id="cookie-text">text</span><a href="privacy.html">Privacy Policy</a>.</p>
      <div class="cookie-buttons">
        <button id="cookie-accept">Accept</button>
        <button id="cookie-decline">Decline</button>
      </div>
    </div>

    <div class="budget-container">
      <div class="app-title">
        <a href="">BudgetApp</a>
        <div class="lang-toggle">
          <button id="lang-en" class="lang-btn lang-active">EN</button>
          <button id="lang-zh" class="lang-btn">中文</button>
        </div>
      </div>
      <div class="balance">
        <div class="value"><small>$</small>0</div>
      </div>
      <div class="account">
        <div class="income">
          <div class="income-total"><small>$</small>0</div>
        </div>
        <div class="chart"></div>
        <div class="outcome">
          <div class="outcome-total"><small>$</small>0</div>
        </div>
      </div>
      <div class="budget-dashboard">
        <div class="dash-title">Dashboard</div>
        <div class="toggle">
          <button class="first-tab" role="tab" aria-selected="false">Expenses</button>
          <button class="second-tab" role="tab" aria-selected="false">Income</button>
          <button class="third-tab focus" role="tab" aria-selected="true">All</button>
        </div>
        <div class="hide" id="expense" role="tabpanel">
          <ul class="list"></ul>
          <div class="input">
            <input type="text" id="expense-title-input" placeholder="title" />
            <input type="number" id="expense-amount-input" placeholder="$0" />
            <button class="add-expense" aria-label="Add expense">+</button>
          </div>
        </div>
        <div class="hide" id="income" role="tabpanel">
          <ul class="list"></ul>
          <div class="input">
            <input type="text" id="income-title-input" placeholder="title" />
            <input type="number" id="income-amount-input" placeholder="$0" />
            <button class="add-income" aria-label="Add income">+</button>
          </div>
        </div>
        <div id="all" role="tabpanel">
          <ul class="list"></ul>
        </div>
      </div>
      <div class="app-footer">
        <a href="privacy.html">Privacy Policy</a>
      </div>
    </div>
  `;
}

function bootstrapApp(initialEntries = []) {
  jest.resetModules();
  buildDOM();

  localStorage.clear();
  localStorage.setItem("cookie_accepted", "true");
  if (initialEntries.length > 0) {
    localStorage.setItem("entry_list", JSON.stringify(initialEntries));
  }

  // mock updateChart
  global.updateChart = jest.fn();

  // mock i18n functions
  global.applyTranslations = jest.fn();
  global.getCurrentLang = jest.fn(() => "en");
  global.translations = {
    en: {
      alertEmptyTitle: "Please enter a title.",
      alertTitleLength: "Title must be 30 characters or less.",
      alertEmptyAmount: "Please enter an amount.",
      alertNegativeAmount: "Amount must be greater than 0.",
      alertMaxAmount: "Amount must not exceed 1,000,000.",
      alertDecimalAmount: "Amount must have at most 2 decimal places.",
    }
  };

  jest.isolateModules(() => {
    require("../budget.js");
  });
}

// ── calculateTotal & calculateBalance ──────────────────────
describe("calculateTotal", () => {
  beforeEach(() => bootstrapApp());

  test("sums income entries correctly", () => {
    const { calculateTotal } = require("../budget.js");
    const list = [
      { type: "income", amount: 1000 },
      { type: "income", amount: 500 },
      { type: "expense", amount: 200 },
    ];
    expect(calculateTotal("income", list)).toBe(1500);
  });

  test("sums expense entries correctly", () => {
    const { calculateTotal } = require("../budget.js");
    const list = [
      { type: "expense", amount: 200 },
      { type: "expense", amount: 300 },
      { type: "income", amount: 1000 },
    ];
    expect(calculateTotal("expense", list)).toBe(500);
  });

  test("returns 0 for empty list", () => {
    const { calculateTotal } = require("../budget.js");
    expect(calculateTotal("income", [])).toBe(0);
  });

  test("returns 0 when no matching type", () => {
    const { calculateTotal } = require("../budget.js");
    const list = [{ type: "expense", amount: 100 }];
    expect(calculateTotal("income", list)).toBe(0);
  });

  test("handles floating point correctly", () => {
    const { calculateTotal } = require("../budget.js");
    const list = [
      { type: "expense", amount: 0.1 },
      { type: "expense", amount: 0.2 },
    ];
    expect(calculateTotal("expense", list)).toBe(0.3);
  });
});

describe("calculateBalance", () => {
  beforeEach(() => bootstrapApp());

  test("returns positive balance when income > expense", () => {
    const { calculateBalance } = require("../budget.js");
    expect(calculateBalance(1000, 300)).toBe(700);
  });

  test("returns negative balance when expense > income", () => {
    const { calculateBalance } = require("../budget.js");
    expect(calculateBalance(300, 1000)).toBe(-700);
  });

  test("returns 0 when equal", () => {
    const { calculateBalance } = require("../budget.js");
    expect(calculateBalance(500, 500)).toBe(0);
  });

  test("handles zero income", () => {
    const { calculateBalance } = require("../budget.js");
    expect(calculateBalance(0, 500)).toBe(-500);
  });

  test("handles zero expense", () => {
    const { calculateBalance } = require("../budget.js");
    expect(calculateBalance(500, 0)).toBe(500);
  });
});

// ── DOM Integration Tests ───────────────────────────────────
describe("adds an income entry and updates totals", () => {
  test("income entry appears in list and updates balance", () => {
    bootstrapApp();
    document.getElementById("income-title-input").value = "Salary";
    document.getElementById("income-amount-input").value = "2000";
    document.querySelector(".add-income").click();

    expect(document.querySelector(".income-total").textContent).toContain("2000");
    expect(document.querySelector(".balance .value").textContent).toContain("2000");
    expect(document.querySelector("#income .list").textContent).toContain("Salary");
    expect(document.querySelector("#all .list").textContent).toContain("Salary");
  });
});

describe("adds an expense entry and updates totals", () => {
  test("expense entry appears in list and updates outcome", () => {
    bootstrapApp();
    document.getElementById("expense-title-input").value = "Rent";
    document.getElementById("expense-amount-input").value = "500";
    document.querySelector(".add-expense").click();

    expect(document.querySelector(".outcome-total").textContent).toContain("500");
    expect(document.querySelector("#expense .list").textContent).toContain("Rent");
    expect(document.querySelector("#all .list").textContent).toContain("Rent");
  });
});

describe("validation", () => {
  test("does not add expense when title is empty", () => {
    bootstrapApp();
    window.alert = jest.fn();
    document.getElementById("expense-title-input").value = "";
    document.getElementById("expense-amount-input").value = "50";
    document.querySelector(".add-expense").click();

    expect(document.querySelector("#expense .list").children.length).toBe(0);
    expect(window.alert).toHaveBeenCalled();
  });

  test("does not add expense when amount is zero or negative", () => {
    bootstrapApp();
    window.alert = jest.fn();
    document.getElementById("expense-title-input").value = "Test";
    document.getElementById("expense-amount-input").value = "-10";
    document.querySelector(".add-expense").click();

    expect(document.querySelector("#expense .list").children.length).toBe(0);
    expect(window.alert).toHaveBeenCalled();
  });

  test("does not add income when title exceeds 30 characters", () => {
    bootstrapApp();
    window.alert = jest.fn();
    document.getElementById("income-title-input").value = "A".repeat(31);
    document.getElementById("income-amount-input").value = "100";
    document.querySelector(".add-income").click();

    expect(document.querySelector("#income .list").children.length).toBe(0);
    expect(window.alert).toHaveBeenCalled();
  });
});

describe("tab switching", () => {
  test("switches to income tab and hides other sections", () => {
    bootstrapApp();
    document.querySelector(".second-tab").click();

    expect(document.getElementById("income").classList.contains("hide")).toBe(false);
    expect(document.getElementById("expense").classList.contains("hide")).toBe(true);
    expect(document.getElementById("all").classList.contains("hide")).toBe(true);
  });

  test("switches to expense tab and hides other sections", () => {
    bootstrapApp();
    document.querySelector(".first-tab").click();

    expect(document.getElementById("expense").classList.contains("hide")).toBe(false);
    expect(document.getElementById("income").classList.contains("hide")).toBe(true);
    expect(document.getElementById("all").classList.contains("hide")).toBe(true);
  });
});

describe("renders saved entries from localStorage on startup", () => {
  test("loads existing income entry from localStorage", () => {
    bootstrapApp([{ type: "income", title: "Freelance", amount: 800 }]);

    expect(document.querySelector(".income-total").textContent).toContain("800");
    expect(document.querySelector(".balance .value").textContent).toContain("800");
    expect(document.querySelector("#income .list").textContent).toContain("Freelance");
    expect(document.querySelector("#all .list").textContent).toContain("Freelance");
  });
});

describe("cookie banner", () => {
  test("hides banner when cookie already accepted", () => {
    localStorage.setItem("cookie_accepted", "true");
    bootstrapApp();
    const banner = document.getElementById("cookie-banner");
    expect(banner.style.display).toBe("none");
  });

  test("hides banner after clicking accept", () => {
    localStorage.removeItem("cookie_accepted");
    bootstrapApp();
    document.getElementById("cookie-accept").click();
    expect(document.getElementById("cookie-banner").style.display).toBe("none");
    expect(localStorage.getItem("cookie_accepted")).toBe("true");
  });

  test("hides banner after clicking decline", () => {
    localStorage.removeItem("cookie_accepted");
    bootstrapApp();
    document.getElementById("cookie-decline").click();
    expect(document.getElementById("cookie-banner").style.display).toBe("none");
    expect(localStorage.getItem("cookie_accepted")).toBe("false");
  });
});

describe("delete entry", () => {
  test("deletes an expense entry", () => {
    bootstrapApp();
    document.getElementById("expense-title-input").value = "Rent";
    document.getElementById("expense-amount-input").value = "500";
    document.querySelector(".add-expense").click();

    // 切到expense tab
    document.querySelector(".first-tab").click();

    // 点删除按钮
    const deleteBtn = document.querySelector("#expense .list button#delete");
    deleteBtn.click();

    expect(document.querySelector("#expense .list").children.length).toBe(0);
    expect(document.querySelector(".outcome-total").textContent).toContain("0");
  });

  test("deletes an income entry", () => {
    bootstrapApp();
    document.getElementById("income-title-input").value = "Salary";
    document.getElementById("income-amount-input").value = "1000";
    document.querySelector(".add-income").click();

    document.querySelector(".second-tab").click();

    const deleteBtn = document.querySelector("#income .list button#delete");
    deleteBtn.click();

    expect(document.querySelector("#income .list").children.length).toBe(0);
    expect(document.querySelector(".income-total").textContent).toContain("0");
  });
});

describe("edit entry", () => {
  test("edit fills input and removes entry", () => {
    bootstrapApp();
    document.getElementById("expense-title-input").value = "Food";
    document.getElementById("expense-amount-input").value = "100";
    document.querySelector(".add-expense").click();

    document.querySelector(".first-tab").click();

    const editBtn = document.querySelector("#expense .list button#edit");
    editBtn.click();

    expect(document.getElementById("expense-title-input").value).toBe("Food");
    expect(document.getElementById("expense-amount-input").value).toBe("100");
  });
});