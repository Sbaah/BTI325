const Sequelize = require('sequelize');

// fill this with your host information
var sequelize = new Sequelize(
    '', // database
    '', // user
    '', //password
    { // host details
        host: '',
        dialect: '',
        // port: ,
        dialectOptions: {
            ssl: true
        }
    });

var Employee = sequelize.define(
    'Employee', {
        employeeNum: {
            type: Sequelize.INTEGER,
            primaryKey: true, // use "project_id" as a primary key
            autoIncrement: true // automatically increment the value
        },
        firstName: Sequelize.STRING,
        last_name: Sequelize.STRING,
        email: Sequelize.STRING,
        SSN: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addresCity: Sequelize.STRING,
        addressState: Sequelize.STRING,
        addressPostal: Sequelize.STRING,
        maritalStatus: Sequelize.STRING,
        isManager: Sequelize.BOOLEAN,
        employeeManagerNum: Sequelize.INTEGER,
        status: Sequelize.STRING,
        department: Sequelize.INTEGER,
        hireDate: Sequelize.STRING,
    }, {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
    });

var Department = sequelize.define(
    'Department', {
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departmentName: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false
    });

module.exports = {
    initialize() {
        return new Promise((resolve, reject) => {
            var connected = false;
            // try to connect to database
            sequelize
                .authenticate()
                .then(function () {
                    console.log('\nConnection has been established successfully.\n');
                    connected = true;
                })
                .catch(function (err) {
                    console.log('\nUnable to connect to the database:', err + "\n");
                    connected = false;
                });
            // try to sync with database
            sequelize.sync().then(connected = true).catch(function (error) {
                console.log("\nsomething went wrong!\n");
                connected = false;
            });
            if (connected)
                resolve();
            reject("\nunable to sync the database\n");
        });
    },
    getAllEmployees() {
        return new Promise((resolve, reject) => {
            Employee.findAll().then(function (data) {
                if (data.length > 0)
                    resolve(data);
                else
                    reject("\nno results returned\n");
            });

        });
    },
    getEmployeesByStatus(status) {
        return new Promise((resolve, reject) => {
            var empArr = [];
            Employee.findAll().then(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].status == status)
                            empArr.push(data[i]);
                    }
                    resolve(empArr);
                }
                else
                    reject("\nno results returned\n");
            });
        });
    },
    getEmployeesByDepartment(department) {
        return new Promise((resolve, reject) => {
            var empArr = [];
            Employee.findAll().then(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].department == department)
                            empArr.push(data[i]);
                    }
                    resolve(empArr);
                }
                else
                    reject("\nno results returned\n");
            });
        });
    },
    getEmployeesByManager(manager) {
        return new Promise((resolve, reject) => {
            var empArr = [];
            Employee.findAll().then(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].employeeManagerNum == manager)
                            empArr.push(data[i]);
                    }
                    resolve(empArr);
                }
                else
                    reject("\nno results returned\n");
            });
        });
    },
    getEmployeesByNum(num) {
        return new Promise((resolve, reject) => {
            var empArr = [];
            Employee.findAll().then(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].employeeNum == num)
                            empArr.push(data[i]);
                           
                    }
                    resolve(empArr);
                }
                else
                    reject("\nno results returned\n");
            });
        });
    },
    getManagers() {
        return new Promise((resolve, reject) => {
            var empArr = [];
            Employee.findAll().then(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].isManager == true)
                            empArr.push(data[i]);

                    }
                    resolve(empArr);
                }
                else
                    reject("\nno results returned\n");
            });
        });
    },
    getDepartments() {
        return new Promise((resolve, reject) => {
            Department.findAll().then(function (data) {
                if (data.length > 0)
                    resolve(data);
                else
                    reject("\nno results returned\n");
            });
        });
    },
    addEmployee(employeeData) {
        return new Promise((resolve, reject) => {
            employeeData.isManager = (employeeData.isManager) ? true : false;
            for (var property in employeeData)
                if (employeeData.hasOwnProperty(property) && employeeData[property] == "")
                    employeeData[property] = null;
            Employee.create(
                {
                    employeeNum: employeeData.employeeNum,
                    firstName: employeeData.firstName,
                    last_name: employeeData.last_name,
                    email: employeeData.email,
                    SSN: employeeData.SSN,
                    addressStreet: employeeData.addressStreet,
                    addresCity: employeeData.addresCity,
                    addressState: employeeData.addressState,
                    addressPostal: employeeData.addressPostal,
                    maritalStatus: employeeData.maritalStatus,
                    isManager: employeeData.isManager,
                    employeeManagerNum: employeeData.employeeManagerNum,
                    status: employeeData.status,
                    department: employeeData.department,
                    hireDate: employeeData.hireDate
                }
            ).then(() => { resolve(); }).catch(() => { reject("\nunable to create employee\n"); })
        });
    },
    updateEmployee(employeeData) {
        return new Promise((resolve, reject) => {
            employeeData.isManager = (employeeData.isManager) ? true : false;
            for (var property in employeeData)
                if (employeeData.hasOwnProperty(property) && employeeData[property] == "")
                    employeeData[property] = null;
            Employee.update(
                {
                    employeeNum: employeeData.employeeNum,
                    firstName: employeeData.firstName,
                    last_name: employeeData.last_name,
                    email: employeeData.email,
                    SSN: employeeData.SSN,
                    addressStreet: employeeData.addressStreet,
                    addresCity: employeeData.addresCity,
                    addressState: employeeData.addressState,
                    addressPostal: employeeData.addressPostal,
                    maritalStatus: employeeData.maritalStatus,
                    isManager: employeeData.isManager,
                    employeeManagerNum: employeeData.employeeManagerNum,
                    status: employeeData.status,
                    department: employeeData.department,
                    hireDate: employeeData.hireDate
                }, {
                    where: {
                        employeeNum: employeeData.employeeNum
                    }
                }).then(() => { resolve(); }).catch(() => { reject("\nunable to update employee\n"); })
        })
    },
    deleteEmployeeByNum(empNum) {
        return new Promise((resolve, reject) => {
            Employee.destroy({
                where: {
                    employeeNum: empNum
                }
            }).then(() => { resolve(); }).catch(() => { reject("\nunable to delete employee\n"); })
        })
    },
    addDepartment(departmentData) {
        return new Promise((resolve, reject) => {
            for (var property in departmentData)
                if (departmentData.hasOwnProperty(property) && departmentData[property] == "")
                    departmentData[property] = null;
            Department.create(
                {
                    departmentId: departmentData.departmentId,
                    departmentName: departmentData.departmentName
                }
            ).then(() => { resolve(); }).catch(() => { reject("\nunable to create department\n"); })
        });
    },
    updateDepartment(departmentData) {
        return new Promise((resolve, reject) => {
            for (var property in departmentData)
                if (departmentData.hasOwnProperty(property) && departmentData[property] == "")
                    departmentData[property] = null;
            Department.update(
                {
                    departmentId: departmentData.departmentId,
                    departmentName: departmentData.departmentName
                }, {
                    where: {
                        departmentId: departmentData.departmentId
                    }
                }).then(() => { resolve(); }).catch(() => { reject("\nunable to update department\n"); })
        })
    },
    deleteDepartmentById(depId) {
        return new Promise((resolve, reject) => {
            Department.destroy({
                where: {
                    departmentId: depId
                }
            }).then(() => { resolve(); }).catch(() => { reject("\nunable to delete department\n"); })
        })
    },
    getDepartmentById(id) {
        return new Promise((resolve, reject) => {
            var depArr = [];
            Department.findAll().then(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].departmentId == id)
                            depArr.push(data[i]);
                    }
                    resolve(depArr);
                }
                else
                    reject("\nno results returned\n");

            });
        });
    },
}