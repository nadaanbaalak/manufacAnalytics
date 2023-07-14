var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var uniqueIds = 0;
var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.ceo = ceo;
        this.moveStack = [];
        this.redoStack = [];
    }
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        var _a;
        var move = {
            employeeId: employeeID,
            newSupervisorId: supervisorID,
            oldSupervisor: this.findSupervisor(this.ceo, employeeID),
            subordinates: ((_a = this.findEmployee(this.ceo, employeeID)) === null || _a === void 0 ? void 0 : _a.subordinates) || [],
        };
        if (this.isValidMove(move)) {
            this.performMove(move);
        }
    };
    EmployeeOrgApp.prototype.undo = function () {
        if (this.moveStack.length > 0) {
            var move = this.moveStack.pop();
            if (move) {
                this.undoMove(move);
                this.redoStack.push(move);
            }
        }
    };
    EmployeeOrgApp.prototype.redo = function () {
        if (this.redoStack.length > 0) {
            var nextMove = this.redoStack.pop();
            if (nextMove) {
                this.performMove(nextMove);
                this.moveStack.push(nextMove);
            }
        }
    };
    EmployeeOrgApp.prototype.findEmployee = function (root, employeeID) {
        if (root.uniqueId === employeeID) {
            return root;
        }
        for (var _i = 0, _a = root.subordinates; _i < _a.length; _i++) {
            var employee = _a[_i];
            var targetEmployee = this.findEmployee(employee, employeeID);
            if (targetEmployee) {
                return targetEmployee;
            }
        }
        return undefined;
    };
    EmployeeOrgApp.prototype.findSupervisor = function (root, employeeID) {
        for (var _i = 0, _a = root.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            if (subordinate.uniqueId === employeeID) {
                return root;
            }
            var supervisor = this.findSupervisor(subordinate, employeeID);
            if (supervisor) {
                return supervisor;
            }
        }
        return undefined;
    };
    EmployeeOrgApp.prototype.isCyclic = function (supervisor, employee) {
        if (supervisor === employee) {
            return true;
        }
        for (var _i = 0, _a = supervisor.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            if (this.isCyclic(subordinate, employee)) {
                return true;
            }
        }
        return false;
    };
    /**
     * It's a valid move if both employee and new supervisor exist, no cycle is formed and
     * old supervisor and new supervisor are different employees
     * @param move
     * @returns true/false
     */
    EmployeeOrgApp.prototype.isValidMove = function (move) {
        var employee = this.findEmployee(this.ceo, move.employeeId);
        var newSupervisor = this.findEmployee(this.ceo, move.newSupervisorId);
        if (!employee || !newSupervisor) {
            return false;
        }
        var oldSupervisor = move.oldSupervisor;
        return (!this.isCyclic(newSupervisor, employee) &&
            (!oldSupervisor || oldSupervisor !== newSupervisor));
    };
    EmployeeOrgApp.prototype.performMove = function (move) {
        var employeeToBeMoved = this.findEmployee(this.ceo, move.employeeId);
        var newSupervisor = this.findEmployee(this.ceo, move.newSupervisorId);
        if (employeeToBeMoved && newSupervisor) {
            var oldSupervisor = move.oldSupervisor;
            if (oldSupervisor) {
                // removing the employee from subordinates list of old supervisor
                oldSupervisor.subordinates = oldSupervisor.subordinates.filter(function (item) { return item.uniqueId !== move.employeeId; });
                //adding employees subordinates as subordinates of old supervisor
                oldSupervisor.subordinates = __spreadArray(__spreadArray([], oldSupervisor.subordinates, true), employeeToBeMoved.subordinates, true);
            }
            newSupervisor.subordinates.push(employeeToBeMoved);
            this.moveStack.push(move);
        }
    };
    EmployeeOrgApp.prototype.undoMove = function (move) {
        var employee = this.findEmployee(this.ceo, move.employeeId);
        var oldSupervisor = move.oldSupervisor;
        if (employee && oldSupervisor) {
            var newSupervisor = this.findEmployee(this.ceo, move.newSupervisorId);
            // removing him from the new supervisor's subordinates
            if (newSupervisor) {
                newSupervisor.subordinates = newSupervisor.subordinates.filter(function (subordinate) { return subordinate.uniqueId !== move.employeeId; });
            }
            // pushing him as the subordinate of his old supervisor
            oldSupervisor.subordinates.push(employee);
            oldSupervisor.subordinates = oldSupervisor.subordinates.filter(function (item) {
                var employeeSubordinate = move.subordinates.find(function (subordinate) {
                    return subordinate.uniqueId === item.uniqueId;
                });
                if (employeeSubordinate) {
                    return false;
                }
                return true;
            });
            // restoring his own subordinates
            employee.subordinates = move.subordinates;
        }
    };
    return EmployeeOrgApp;
}());
var willTurner = new Employee("Will Turner", []);
var tinaTeff = new Employee("Tina Teff", [willTurner]);
var bobSaget = new Employee("Bob Saget", [tinaTeff]);
var maryBlue = new Employee("Mary Blue", []);
var cassandraReynolds = new Employee("Cassandra Reynolds", [
    maryBlue,
    bobSaget,
]);
var margotDonald = new Employee("Margot Donald", [cassandraReynolds]);
var thomasBrown = new Employee("Thomas Brown", []);
var harryTobs = new Employee("Harry Tobs", [thomasBrown]);
var georgeCarrey = new Employee("George Carrey", []);
var garyStyles = new Employee("Gary Styles", []);
var tylerSimpson = new Employee("Tyler Simpson", [
    garyStyles,
    georgeCarrey,
    harryTobs,
]);
var benWillis = new Employee("Ben Willis", []);
var sophieTurner = new Employee("Sophie Turner", []);
var georginaFlangy = new Employee("Georgine Flangy", [sophieTurner]);
var ceo = new Employee("Abhishek Sharma", [
    margotDonald,
    georginaFlangy,
    benWillis,
    tylerSimpson,
]);
var employeeOrgApp = new EmployeeOrgApp(ceo);
console.log(ceo);
employeeOrgApp.move(11, 14);
console.log(ceo);
employeeOrgApp.undo();
console.log(ceo);
function Employee(name, suborinatesArray) {
    this.name = name;
    this.uniqueId = uniqueIds + 1;
    this.subordinates = suborinatesArray;
    uniqueIds = uniqueIds + 1;
}
