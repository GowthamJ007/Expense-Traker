// Get DOM elements
const balance = document.getElementById('balance'),
  money_plus = document.getElementById('money-plus'),
  money_minus = document.getElementById('money-minus'),
  list = document.getElementById('list'),
  form = document.getElementById('form'),
  text = document.getElementById('text'),
  incomeInput = document.getElementById('income'),
  expenseInput = document.getElementById('expense'),
  themeToggle = document.getElementById('theme-toggle');
const categoryInput = document.getElementById('category');

// Load transactions from localStorage or initialize empty array
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();
  // Validate input fields
  if (
    text.value.trim() === '' ||
    categoryInput.value.trim() === '' ||
    (incomeInput.value.trim() === '' && expenseInput.value.trim() === '')
  ) {
    alert('Please add text, category, and either income or expense');
    return;
  }
  if (incomeInput.value && expenseInput.value) {
    alert('Please fill only one: income or expense');
    return;
  }
  // Determine amount (positive for income, negative for expense)
  let amount = incomeInput.value ? +incomeInput.value : -Math.abs(+expenseInput.value);
  // Create transaction object
  const transaction = {
    id: generateID(),
    text: text.value,
    category: categoryInput.value,
    amount,
    date: new Date().toLocaleString() // Add date and time
  };
  // Add to transactions array and update storage/UI
  transactions.push(transaction);
  updateLocalStorage();
  init();
  // Reset form fields
  text.value = '';
  categoryInput.value = '';
  incomeInput.value = '';
  expenseInput.value = '';
}

// Generate a random ID for each transaction
function generateID() { return Math.floor(Math.random() * 100000000); }

// Add a single transaction to the DOM (not used when grouping)
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `${transaction.text} <span>${sign}$${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>`;
  list.appendChild(item);
}

// Add grouped transactions by category to the DOM
function addTransactionDOMGrouped(grouped) {
  list.innerHTML = '';
  Object.keys(grouped).forEach(category => {
    // Create a wrapper for each category group
    const group = document.createElement('ul');
    group.className = 'category-group';

    // Category heading
    const catLi = document.createElement('li');
    catLi.className = 'category-heading right';
    catLi.innerHTML = category;
    group.appendChild(catLi);

    // Transactions in this category
    grouped[category].forEach(transaction => {
      const sign = transaction.amount < 0 ? '-' : '+';
      const item = document.createElement('li');
      item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
      item.innerHTML = `
        ${transaction.text}
        <span style="display:block;font-size:0.85em;color:#888;">${transaction.date || ''}</span>
        <span>${sign}$${Math.abs(transaction.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
      `;
      group.appendChild(item);
    });

    // Append the group to the main list
    list.appendChild(group);
  });
}

// Update balance, income, and expense values
function updateValues() {
  const amounts = transactions.map(t => t.amount),
    total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2),
    income = amounts.filter(a => a > 0).reduce((acc, item) => acc + item, 0).toFixed(2),
    expense = (amounts.filter(a => a < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);
  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
}

// Remove a transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

// Save transactions to localStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize app: group transactions by category and update UI
function init() {
  // Group transactions by category
  const grouped = {};
  transactions.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });
  addTransactionDOMGrouped(grouped);
  updateValues();
}

// Initial load
init();

// Event listeners
form.addEventListener('submit', addTransaction);
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.innerHTML = `<span>${document.body.classList.contains('dark') ? '☀️' : '🌙'}</span>`;
});