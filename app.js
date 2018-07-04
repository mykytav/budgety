//BUDGET CONTROLLER
const budgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
  }

  Expense.prototype.calcPercentage = totalIncome => {
    totalIncome > 0
      ? (this.percentage = Math.round((this.value / totalIncome) * 100))
      : (this.percentage = -1);
  };

  Expense.prototype.getPercentage = () => this.percentage;

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(cur => {
      sum += cur.value;
      data.totals[type] = sum;
    });
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem(type, des, val) {
      let newItem, ID;

      //Create a new ID
      data.allItems[type].length > 0
        ? (ID = data.allItems[type][data.allItems[type].length - 1].id + 1)
        : (ID = 0);

      //Create a new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      //Push it into the data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem(type, id) {
      let ids, index;

      ids = data.allItems[type].map(current => current.id);
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget() {
      //1. Calculate the total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //2. Calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //3. Calculate the percentage of income that we spent
      data.totals.inc > 0
        ? (data.percentage = Math.round(
            (data.totals.exp / data.totals.inc) * 100
          ))
        : (data.percentage = -1);
    },

    calculatePercentages() {
      data.allItems.exp.forEach(cur => cur.calcPercentage(data.totals.inc));
      console.log(data.allItems.exp);
    },

    getPercentages() {
      const allPerc = data.allItems.exp.map(cur => cur.getPercentage());
      return allPerc;
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();
//---------------------------------------------------------------------------------//
//UI CONTROLLER
const UIController = (() => {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  const formatNumber = (num, type) => {
    num = Math.abs(num).toFixed(2);
    const numSplit = num.split('.');
    let int = numSplit[0];
    let dec = numSplit[1];

    if (int.length > 3 && int.length <= 6) {
      int = `${int.substr(0, int.length - 3)}, ${int.substr(
        int.length - 3,
        3
      )}`;
    }
    // else if (int.length > 6) {
    //   int = int.replace(int, /^\d{,3}(,\d{3})*(\.\d+)?$/);
    // }

    return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`;
  };

  const nodeListForEach = (list, callback) => {
    list.forEach((item, i) => {
      callback(item, i);
    });
  };

  return {
    getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //will be neither inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem(obj, type) {
      let html, element;
      //Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem(selectorID) {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields() {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      );
      const fieldsArr = Array.from(fields);

      fieldsArr.forEach(cur => (cur.value = ''));

      fieldsArr[0].focus();
    },

    displayBudget(obj) {
      let type;
      obj.budget >= 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');

      obj.percentage > 0
        ? (document.querySelector(DOMstrings.percentageLabel).textContent = `${
            obj.percentage
          }%`)
        : (document.querySelector(DOMstrings.percentageLabel).textContent =
            '-');
    },

    displayPercentages(percentages) {
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, (current, index) => {
        percentages[index] > 0
          ? (current.textContent = `${percentages[index]}%`)
          : current.textContent === '--';
      });
    },

    displayMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'Octocber',
        'November',
        'December'
      ];

      document.querySelector(DOMstrings.dateLabel).textContent = `${
        months[month]
      } ${year}`;
    },

    changedType() {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputType}, ${DOMstrings.inputDescription}, 
				${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, cur => {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    //Method which exposed to the public DOMstrings
    getDOMstrings() {
      return DOMstrings;
    }
  };
})();
//-------------------------------------------------------------------//
//GLOBAL APP CONTROLLER
const controller = ((budgetCtrl, UICtrl) => {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', e => {
      if (e.keycode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  const updateBudget = () => {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    const budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    //1. Calculate percetages
    budgetCtrl.calculatePercentages();
    //2. Read the percentages from the budget controller
    const percentages = budgetCtrl.getPercentages();
    //3. Update the UI with new percentages
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    //1. Get the field input data
    const input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget controller
      const newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      //4. Clear fields
      UICtrl.clearFields();
      //5.Calculate and update budget
      updateBudget();
      //6. Calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = e => {
    const itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const splitID = itemID.split('-');
      const type = splitID[0];
      const ID = parseInt(splitID[1]);

      //1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      //3. Update and show the new budget
      updateBudget();
      //4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init() {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
