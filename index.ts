interface IEmployee {
  uniqueId: number;
  name: string;
  subordinates: Array<IEmployee>;
}

interface IEmployeeOrgApp {
  ceo: IEmployee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

interface IMove {
  employeeId: number;
  oldSupervisor: IEmployee | undefined;
  newSupervisorId: number;
  subordinates: Array<IEmployee>;
}

let uniqueIds = 0;

class EmployeeOrgApp implements IEmployeeOrgApp {
  private moveStack: Array<IMove>;
  private redoStack: Array<IMove>;
  ceo: IEmployee;

  constructor(ceo: IEmployee) {
    this.ceo = ceo;
    this.moveStack = [];
    this.redoStack = [];
  }

  move(employeeID: number, supervisorID: number) {
    const move = {
      employeeId: employeeID,
      newSupervisorId: supervisorID,
      oldSupervisor: this.findSupervisor(this.ceo, employeeID),
      subordinates: this.findEmployee(this.ceo, employeeID)?.subordinates || [],
    };

    if (this.isValidMove(move)) {
      this.performMove(move);
    }
  }

  undo() {
    if (this.moveStack.length > 0) {
      const move = this.moveStack.pop();
      if (move) {
        this.undoMove(move);
        this.redoStack.push(move);
      }
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const nextMove = this.redoStack.pop();
      if (nextMove) {
        this.performMove(nextMove);
        this.moveStack.push(nextMove);
      }
    }
  }

  private findEmployee(
    root: IEmployee,
    employeeID: number
  ): IEmployee | undefined {
    if (root.uniqueId === employeeID) {
      return root;
    }

    for (const employee of root.subordinates) {
      const targetEmployee = this.findEmployee(employee, employeeID);
      if (targetEmployee) {
        return targetEmployee;
      }
    }
    return undefined;
  }

  private findSupervisor(
    root: IEmployee,
    employeeID: number
  ): IEmployee | undefined {
    for (const subordinate of root.subordinates) {
      if (subordinate.uniqueId === employeeID) {
        return root;
      }
      const supervisor = this.findSupervisor(subordinate, employeeID);
      if (supervisor) {
        return supervisor;
      }
    }
    return undefined;
  }

  private isCyclic(supervisor: IEmployee, employee: IEmployee): boolean {
    if (supervisor === employee) {
      return true;
    }

    for (const subordinate of supervisor.subordinates) {
      if (this.isCyclic(subordinate, employee)) {
        return true;
      }
    }

    return false;
  }

  /**
   * It's a valid move if both employee and new supervisor exist, no cycle is formed and
   * old supervisor and new supervisor are different employees
   * @param move
   * @returns true/false
   */
  private isValidMove(move: IMove): boolean {
    const employee = this.findEmployee(this.ceo, move.employeeId);
    const newSupervisor = this.findEmployee(this.ceo, move.newSupervisorId);

    if (!employee || !newSupervisor) {
      return false;
    }

    const oldSupervisor = move.oldSupervisor;

    return (
      !this.isCyclic(newSupervisor, employee) &&
      (!oldSupervisor || oldSupervisor !== newSupervisor)
    );
  }

  private performMove(move: IMove) {
    const employeeToBeMoved = this.findEmployee(this.ceo, move.employeeId);
    const newSupervisor = this.findEmployee(this.ceo, move.newSupervisorId);

    if (employeeToBeMoved && newSupervisor) {
      const oldSupervisor = move.oldSupervisor;
      if (oldSupervisor) {
        // removing the employee from subordinates list of old supervisor
        oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
          (item) => item.uniqueId !== move.employeeId
        );
        //adding employees subordinates as subordinates of old supervisor
        oldSupervisor.subordinates = [
          ...oldSupervisor.subordinates,
          ...employeeToBeMoved.subordinates,
        ];
      }
      newSupervisor.subordinates.push(employeeToBeMoved);
      this.moveStack.push(move);
    }
  }

  private undoMove(move: IMove): void {
    const employee = this.findEmployee(this.ceo, move.employeeId);
    const oldSupervisor = move.oldSupervisor;

    if (employee && oldSupervisor) {
      const newSupervisor = this.findEmployee(this.ceo, move.newSupervisorId);

      // removing him from the new supervisor's subordinates
      if (newSupervisor) {
        newSupervisor.subordinates = newSupervisor.subordinates.filter(
          (subordinate) => subordinate.uniqueId !== move.employeeId
        );
      }
      // pushing him as the subordinate of his old supervisor
      oldSupervisor.subordinates.push(employee);
      oldSupervisor.subordinates = oldSupervisor.subordinates.filter((item) => {
        const employeeSubordinate = move.subordinates.find((subordinate) => {
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
  }
}

const willTurner = new Employee("Will Turner", []);
const tinaTeff = new Employee("Tina Teff", [willTurner]);
const bobSaget = new Employee("Bob Saget", [tinaTeff]);
const maryBlue = new Employee("Mary Blue", []);
const cassandraReynolds = new Employee("Cassandra Reynolds", [
  maryBlue,
  bobSaget,
]);
const margotDonald = new Employee("Margot Donald", [cassandraReynolds]);
const thomasBrown = new Employee("Thomas Brown", []);
const harryTobs = new Employee("Harry Tobs", [thomasBrown]);
const georgeCarrey = new Employee("George Carrey", []);
const garyStyles = new Employee("Gary Styles", []);
const tylerSimpson = new Employee("Tyler Simpson", [
  garyStyles,
  georgeCarrey,
  harryTobs,
]);
const benWillis = new Employee("Ben Willis", []);
const sophieTurner = new Employee("Sophie Turner", []);
const georginaFlangy = new Employee("Georgine Flangy", [sophieTurner]);
const ceo = new Employee("Abhishek Sharma", [
  margotDonald,
  georginaFlangy,
  benWillis,
  tylerSimpson,
]);

const employeeOrgApp = new EmployeeOrgApp(ceo);
console.log(ceo);
employeeOrgApp.move(11, 14);
console.log(ceo);
employeeOrgApp.undo();
console.log(ceo);

function Employee(name: string, suborinatesArray: Array<IEmployee>) {
  this.name = name;
  this.uniqueId = uniqueIds + 1;
  this.subordinates = suborinatesArray;
  uniqueIds = uniqueIds + 1;
}
