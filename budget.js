function showToast(message, type = "success") {
  const toast = document.getElementById("toast-message");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("success", "error");
  toast.classList.add(type);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");
const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

let ENTRY_LIST;
let balance = 0, income = 0, outcome = 0;
const DELETE = "delete", EDIT = "edit";

ENTRY_LIST = JSON.parse(localStorage.getItem("entry_list")) || [];
updateUI();

expenseBtn.addEventListener("click", () => { show(expenseEl); hide([incomeEl, allEl]); active(expenseBtn); inactive([incomeBtn, allBtn]); });
incomeBtn.addEventListener("click", () => { show(incomeEl); hide([expenseEl, allEl]); active(incomeBtn); inactive([expenseBtn, allBtn]); });
allBtn.addEventListener("click", () => { show(allEl); hide([incomeEl, expenseEl]); active(allBtn); inactive([incomeBtn, expenseBtn]); });

addExpense.addEventListener("click", async function() {
  const title = expenseTitle.value.trim();
  const amount = +expenseAmount.value;
  if (!title) { showToast("Please enter a title.", "error"); return; }
  if (title.length > 30) { showToast("Title must be 30 characters or less.", "error"); return; }
  if (!expenseAmount.value) { showToast("Please enter an amount.", "error"); return; }
  if (amount <= 0) { showToast("Amount must be greater than 0.", "error"); return; }
  if (amount > 1000000) { showToast("Amount must not exceed 1,000,000.", "error"); return; }
  if (Math.round(amount * 100) !== amount * 100) { showToast("Amount must have at most 2 decimal places.", "error"); return; }

  const originalText = addExpense.innerHTML;
  addExpense.classList.add("loading");
  addExpense.innerHTML = '< img src="icon/plus.png" alt=""> Adding...';
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    ENTRY_LIST.push({ type: "expense", title, amount });
    updateUI();
    clearInput([expenseTitle, expenseAmount]);
    showToast("Expense added successfully!", "success");
  } catch(e) { showToast("Failed to add expense.", "error");
  } finally {
    addExpense.classList.remove("loading");
    addExpense.innerHTML = originalText;
  }
});

addIncome.addEventListener("click", async function() {
  const title = incomeTitle.value.trim();
  const amount = +incomeAmount.value;
  if (!title) { showToast("Please enter a title.", "error"); return; }
  if (title.length > 30) { showToast("Title must be 30 characters or less.", "error"); return; }
  if (!incomeAmount.value) { showToast("Please enter an amount.", "error"); return; }
  if (amount <= 0) { showToast("Amount must be greater than 0.", "error"); return; }
  if (amount > 1000000) { showToast("Amount must not exceed 1,000,000.", "error"); return; }
  if (Math.round(amount * 100) !== amount * 100) { showToast("Amount must have at most 2 decimal places.", "error"); return; }

  const originalText = addIncome.innerHTML;
  addIncome.classList.add("loading");
  addIncome.innerHTML = '< img src="icon/plus.png" alt=""> Adding...';
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    ENTRY_LIST.push({ type: "income", title, amount });
    updateUI();
    clearInput([incomeTitle, incomeAmount]);
    showToast("Income added successfully!", "success");
  } catch(e) { showToast("Failed to add income.", "error");
  } finally {
    addIncome.classList.remove("loading");
    addIncome.innerHTML = originalText;
  }
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

function deleteOrEdit(e) {
  const btn = e.target.closest("button");
  if (!btn) return;
  const entry = btn.parentNode;
  if (btn.id === EDIT) editEntry(entry);
  else if (btn.id === DELETE) deleteEntry(entry);
}
function deleteEntry(entry) { ENTRY_LIST.splice(entry.id, 1); updateUI(); }
function editEntry(entry) {
  const e = ENTRY_LIST[entry.id];
  if (e.type === "income") {
    incomeTitle.value = e.title;
    incomeAmount.value = e.amount;
  } else {
    expenseTitle.value = e.title;
    expenseAmount.value = e.amount;
  }
  deleteEntry(entry);
}
function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(income - outcome);
  const sign = income >= outcome ? "$" : "-$";
  balanceEl.innerHTML = `<small>${sign}</small>${balance}`;
  outcomeTotalEl.innerHTML = `<small>$</small>${outcome}`;
  incomeTotalEl.innerHTML = `<small>$</small>${income}`;
  clearElement([expenseList, incomeList, allList]);
  ENTRY_LIST.forEach((entry, idx) => {
    if (entry.type === "expense") showEntry(expenseList, entry.type, entry.title, entry.amount, idx);
    else showEntry(incomeList, entry.type, entry.title, entry.amount, idx);
    showEntry(allList, entry.type, entry.title, entry.amount, idx);
  });
  updateChart(income, outcome);
  localStorage.setItem("entry_list", JSON.stringify(ENTRY_LIST));
}
function showEntry(list, type, title, amount, id) {
  const li = document.createElement("li");
  li.id = id; li.className = type;
  const div = document.createElement("div"); div.className = "entry"; div.textContent = `${title} : $${amount}`;
  const editBtn = document.createElement("button"); editBtn.id = EDIT; editBtn.type = "button"; editBtn.setAttribute("aria-label", `Edit ${title}`);
  const delBtn = document.createElement("button"); delBtn.id = DELETE; delBtn.type = "button"; delBtn.setAttribute("aria-label", `Delete ${title}`);
  li.append(div, editBtn, delBtn);
  list.prepend(li);
}
function clearElement(arr) { arr.forEach(el => el.innerHTML = ""); }
function calculateTotal(type, list) { return list.reduce((s, e) => e.type === type ? s + e.amount : s, 0); }
function clearInput(arr) { arr.forEach(i => i.value = ""); }
function show(el) { el.classList.remove("hide"); }
function hide(arr) { arr.forEach(el => el.classList.add("hide")); }
function active(el) { el.classList.add("focus"); el.setAttribute("aria-selected","true"); }
function inactive(arr) { arr.forEach(el => { el.classList.remove("focus"); el.setAttribute("aria-selected","false"); }); }