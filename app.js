
//Budget Controller
var budgetController = (function() {

    function Expense(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    function calcTotal(type) {
        let sum = 0;
        data.allItems[type].forEach(function(current) {
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    }

    let data = {
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
    }

    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            //create new id
            //want ID to be equal to the ID of last item +1
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create new item based on if 'inc' or 'exp'
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push into the data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

            //create an array of the IDs of the data.allItems[type] objects
            //use maps to iterate through the object array and return the id
            //save the new array to ids
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            //get the indexOf the item in the ids array that matches with the passed 'id' variable
            index = ids.indexOf(id);

            //if the index of the id array doesnt equal -1(no matching item found) then the entire object item in the objects array will be deleted using the index we just found
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            } 
        },

        editItem: function (type, id, editDes, editVal) {

            let ids, index;

            ids = data.allItems[type].map(function(cur) {
                return cur.id;
            });

            index = ids.indexOf(id)

            console.log(data.allItems[type][index].value)

            if(index !== -1) {
                data.allItems[type][index].description = editDes;
                data.allItems[type][index].value = parseFloat(editVal);
            } 
        },

        calcBudget: function() {

            //calc total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            //calc budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calc the percentage of income that expenses take up
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {

            //loop through the exp array and for each item, call the getPercentage method and store the array into allPerc
            let allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data)
        }
    }

})();

//UI controller
var UIController = (function() {
        
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetIncome: '.budget__income--value',
        budgetExpenses: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage',
        budgetValue: '.budget__value',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        editBtn: '.item__edit',
        itemDes: '.item__description',
        itemVal: '.item__value'
    };

    function formatNumber(num, type) {

        let int, dec, sign;

        //+ or - befor the number
        //2 decimal points
        //a comma for separating thousands

        num = Math.abs(num); // abs() is a method of the Math prototype
        num = num.toFixed(2); // toFixed is a method of the Number prototype
        //will round decimals to the second place or add deicmals to the second place
        //returns a string
        //can use a method on a primitive data type and it will become an object
        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return `${sign} ${int}.${dec}`
    }

    function unFormatNumber(itemVal) {

        let stringVal, numVal;

        stringVal = itemVal.slice(2,10);
        numVal = parseFloat(stringVal.replace(/,/g, ""));

        return numVal;
    }

    // 
    return {
        getInput: function() {
            return{
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        getEditInput: function(itemID) {
            return {
                description: document.getElementById(itemID).children[1].value,
                value: document.getElementById(itemID).children[2].value
            }
        },

        addListItem: function(obj, type) {

            let html, newHTML, element;

            // create html string with a placeholder text

            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <input type="text" class = "item__newDes" value = "">
                            <input type="number" class = "item__newVal" value = >
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__edit">
                                    <button class="item__edit--btn"><i class="far fa-edit"></i></button>
                                </div>
                                <div class="item__save">
                                    <button class="item__save--btn"><i class="far fa-save"></i></button>
                                </div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="far fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>`
            } else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <input type="text" class = "item__newDes" value = "">
                            <input type="number" class = "item__newVal" value = >
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__percentage"></div>
                                <div class="item__edit">
                                    <button class="item__edit--btn"><i class="far fa-edit"></i></button>
                                </div>
                                <div class="item__save">
                                    <button class="item__save--btn"><i class="far fa-save"></i></button>
                                </div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="far fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>`  
            }

            //replace the placeholder text with some actual data
            // newHTML = html.replace('%id%', obj.id);
            // newHTML = newHTML.replace('%description%', obj.description);
            // newHTML = newHTML.replace('%value%', obj.value);

            //insert html into the DOM with insertAdjacentHTML, beforebegin, afterbegin, beforeend, afterend
            document.querySelector(element).insertAdjacentHTML('beforeend', html)

        },

        deleteListItem: function(selectorID) {

            let el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // save all classes of input into fields node list

            fields.forEach(function(curr) { // iterate through each item in the fields node list and update the current value to ' '
                curr.value = ' ';
            });

            fields[0].focus(); // after the values are updated, set the focus back on the 0 index of fields, which is the inputdescription box
        },

        displayBudget: function(budgetObj) {
            let sign, type;
            if(budgetObj.budget > 0) {
                type = 'inc';
            } else {
                type = 'exp';
            }

            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(budgetObj.budget, type);

            document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(budgetObj.totalInc, 'inc');

            document.querySelector(DOMstrings.budgetExpenses).textContent =formatNumber(budgetObj.totalExp, 'exp');

            if(budgetObj.percentage >= 0) {
                document.querySelector(DOMstrings.expensesPercentage).textContent = budgetObj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            let fields;

            //need to loop through all all elements in fields arr pointing to the divs with item percentages

            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            fields.forEach(function(cur, index) {
                if(percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });

        },

        displayMonth: function() {

            let now, year, month, months;

            now = new Date();
            //let christmas = new Date(2020, 11, 25);

            months = ["January", "february", "march", "April", "may", "june", "july", "august", "september", "october", "novmeber", "december",];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
        },

        changeType: function() {

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue
            )

            fields.forEach(function(cur) {
                cur.classList.toggle('red-focus')
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        editValues: function(itemType, itemID) {
            let itemDes, itemVal, numVal;

            itemDes = document.getElementById(itemID).children[0].textContent;
            itemVal = document.getElementById(itemID).children[3].children[0].textContent;

            //removes the input description and input value
            document.getElementById(itemID).children[0].style.display = "none"
            document.getElementById(itemID).children[3].children[0].style.display = "none";

            //2. add in two inputs
            document.getElementById(itemID).children[1].style.display = "inline-block"
            //itemdocument.getElementById(itemID).children[0].value
            document.getElementById(itemID).children[1].value = itemDes;
            document.getElementById(itemID).children[2].style.display = "inline-block"

            //3.
            //sends the formatted itemVal to get unformatted to a regular number expression
            numVal = unFormatNumber(itemVal);
            //sets the default value in the number input for the item to be the numVal
            document.getElementById(itemID).children[2].value = numVal;
            
            //1. remove everything in the item (keep delete button)
            if(itemType === 'inc') {

                document.querySelector('.item').addEventListener('mouseover', function() {
                    console.log('hey')
                });

                document.getElementById(itemID).children[3].children[1].style.display = 'none'
                
            } else if (itemType === 'exp') {
                document.getElementById(itemID).children[3].children[1].style.display = 'none'
                document.getElementById(itemID).children[3].children[2].style.display = 'none'
            }
        },

        saveEdit: function (itemID, type, des, val) {

            let itemVal;

            itemVal = formatNumber(val, type);

            document.getElementById(itemID).children[0].textContent = des;
            document.getElementById(itemID).children[0].style.display = "inline-block";
            document.getElementById(itemID).children[3].children[0].textContent = itemVal;
            document.getElementById(itemID).children[3].children[0].style.display = "inline-block";

            document.getElementById(itemID).children[1].style.display = "none";
            document.getElementById(itemID).children[2].style.display = "none";
            
            if(type === 'inc') {

                document.getElementById(itemID).children[3].children[1].style.display = 'block'
                
            } else if (type === 'exp') {
                document.getElementById(itemID).children[3].children[1].style.display = 'block';
                document.getElementById(itemID).children[3].children[2].style.display = 'block';
            }

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

//global app controller
var controller = (function(budgetCtrl, UICtrl) {

    function setupEventListeners() {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            if(e.keycode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

        //document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        //document.querySelector(DOM.container).addEventListener('click', ctrlEditItem);

        document.querySelector(DOM.container).addEventListener('click', function (e) {
            //console.log(e.target.parentNode)
            if(e.target.parentNode.className === 'item__delete--btn') {
                ctrlDeleteItem(e);
            } else if (e.target.parentNode.className === 'item__edit--btn') {
                ctrlEditItem(e);
            } else if (e.target.parentNode.className === 'item__save--btn') {
                ctrlSaveItem(e);
            }
        });
    };

    function updateBudget() {
        //1. calculate the budget
        budgetCtrl.calcBudget();

        //2. return the budget
        let budget = budgetCtrl.getBudget();

        //3. display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    function updatePercentages() {
        let percentages;

        //1. calc percentages
        budgetCtrl.calculatePercentages();

        //2. read from budget controller
        percentages = budgetCtrl.getPercentages();

        //3. update the UI
        UICtrl.displayPercentages(percentages);

    }

    function ctrlAddItem() {

        let input, newItem
        //1. get the field input data
        input = UICtrl.getInput();
        //console.log(input);

        if(input.description != "" && !isNaN(input.value) && input.value > 0) {
            
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4 clear the input fields
            UICtrl.clearFields();

            //5 calc and update budget
            updateBudget();

            //6. update percentages
            updatePercentages()
        }
    };

    function ctrlDeleteItem(e) {

        let itemID, splitID, type, id;

        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {

            //inc
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            //1. delete item from data structure
            budgetCtrl.deleteItem(type, id);

            //2. delete item from UI
            UICtrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget(); 

            //4. update percentages
            updatePercentages()
        }

    }

    function ctrlEditItem(e) {
        let itemID, splitID, type, id;
        //1. target the edit item button and set to an id
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            //2. get the type and value
            type = splitID[0];
            id = parseInt(splitID[1]);

            //3. change the item to include two text inputs 
            UICtrl.editValues(type, itemID);
        }
    }

    function ctrlSaveItem(e) {

        //get input data
        let itemID, splitID, type, id, getEdit;
        
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            getEdit = UICtrl.getEditInput(itemID);
            //got getEdit.description and getEdit.value

            //1. change data in data structure
            budgetCtrl.editItem(type, id, getEdit.description, getEdit.value);

            //2. change item in UI
            UICtrl.saveEdit(itemID, type, getEdit.description, getEdit.value);

            //3. update budget 
            updateBudget();

            //4. update percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
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