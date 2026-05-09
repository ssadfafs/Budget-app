function showToast(message, type = "success") {
  const toast = document.getElementById("toast-message");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("success", "error");
  toast.classList.add(type);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

//SELECT ELEMENTS
const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

//SELECT BUTTONS
const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

//INPUT BTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

//VARIABLES
let ENTRY_LIST;
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";

// LOOK IF THERE IS DATA IN LOCAL STORAGE
ENTRY_LIST = JSON.parse(localStorage.getItem("entry_list")) || [];
updateUI();

//EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});
incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});
allBtn.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});

addExpense.addEventListener("click", async function () {
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
  addExpense.innerHTML = '< img src="icon/plus.png" alt="" /> Adding...';
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    let expense = { type: "expense", title, amount };
    ENTRY_LIST.push(expense);
    updateUI();
    clearInput([expenseTitle, expenseAmount]);
    showToast("Expense added successfully!", "success");
  } catch (error) {
    showToast("Failed to add expense.", "error");
  } finally {
    addExpense.classList.remove("loading");
    addExpense.innerHTML = originalText;
  }
});

addIncome.addEventListener("click", async function () {
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
  addIncome.innerHTML = '< img src="icon/plus.png" alt="" /> Adding...';
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    let income = { type: "income", title, amount };
    ENTRY_LIST.push(income);
    updateUI();
    clearInput([incomeTitle, incomeAmount]);
    showToast("Income added successfully!", "success");
  } catch (error) {
    showToast("Failed to add income.", "error");
  } finally {
    addIncome.classList.remove("loading");
    addIncome.innerHTML = originalText;
  }
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

// HELPER FUNCS
function deleteOrEdit(event) {
  const targetBtn = event.target.closest("button");
  if (!targetBtn) return;

  const entry = targetBtn.parentNode;

  if (targetBtn.id == EDIT) {
    editEntry(entry);
  } else if (targetBtn.id == DELETE) {
    deleteEntry(entry);
  }
}

function deleteEntry(entry) {
  ENTRY_LIST.splice(entry.id, 1);
  updateUI();
}

function editEntry(entry) {
  const ENTRY = ENTRY_LIST[entry.id];

  if (ENTRY.type == "income") {
    incomeTitle.value = ENTRY.title;
    incomeAmount.value = ENTRY.amount;
  } else if (ENTRY.type == "expense") {
    expenseTitle.value = ENTRY.title;
    expenseAmount.value = ENTRY.amount;
  }
  deleteEntry(entry);
}

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, outcome));

  let sign = income >= outcome ? "$" : "-$";

  balanceEl.innerHTML = `<small>${sign}</small>${balance}`;
  outcomeTotalEl.innerHTML = `<small>$</small>${outcome}`;
  incomeTotalEl.innerHTML = `<small>$</small>${income}`;

  clearElement([expenseList, incomeList, allList]);

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type == "expense") {
      showEntry(expenseList, entry.type, entry.title, entry.amount, index);
    } else if (entry.type == "income") {
      showEntry(incomeList, entry.type, entry.title, entry.amount, index);
    }
    showEntry(allList, entry.type, entry.title, entry.amount, index);
  });
  updateChart(income, outcome);
  localStorage.setItem("entry_list", JSON.stringify(ENTRY_LIST));
}

function showEntry(list, type, title, amount, id) {
  const li = document.createElement("li");
  li.id = id;
  li.className = type;

  const entryDiv = document.createElement("div");
  entryDiv.className = "entry";
  entryDiv.textContent = `${title} : $${amount}`;

  const editDiv = document.createElement("button");
  editDiv.id = "edit";
  editDiv.type = "button";
  editDiv.setAttribute("aria-label", `Edit ${title}`);

  const deleteDiv = document.createElement("button");
  deleteDiv.id = "delete";
  deleteDiv.type = "button";
  deleteDiv.setAttribute("aria-label", `Delete ${title}`);

  li.appendChild(entryDiv);
  li.appendChild(editDiv);
  li.appendChild(deleteDiv);

  list.insertBefore(li, list.firstChild);
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

function calculateTotal(type, list) {
  let sum = 0;
  list.forEach((entry) => {
    if (entry.type == type) {
      sum += entry.amount;
    }
  });
  return sum;
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    element.classList.add("hide");
  });
}

function active(element) {
  element.classList.add("focus");
  element.setAttribute("aria-selected", "true");
}

function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("focus");
    element.setAttribute("aria-selected", "false");
  });
}