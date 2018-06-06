var express = require("express");
var app = express();
var path = require("path");
const dataServiceComments = require("./data-service-comments.js");
var dataService = require("./data-service.js");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');
const dataServiceAuth = require("./data-service-auth.js");

var HTTP_PORT = process.env.PORT || 8080;

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.use(express.static('public'));

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "somestring", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: 'layout',
    helpers: {
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("\nHandlebars Helper equal needs 2 parameters\n");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

function onHttpStart() {
    console.log("\nExpress http server listening on: " + HTTP_PORT + "\n");
}

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    dataServiceComments.getAllComments()
        .then((dataFromPromise) => {
            res.render("about", { data: dataFromPromise })
        })
        .catch((err) => { console.log("\nError: " + err + "\n"), res.render("about") });

});

app.post("/about/addComment", (req, res) => {
    dataServiceComments.addComment(req.body).then().catch(() => { console.log("\nComment not added\n" + JSON.stringify(req.body, null, 4) + "\n"); });
    res.redirect("/about"); // will redirect in both cases: .then() and .catch()
});
app.post("/about/addReply", (req, res) => {
    dataServiceComments.addReply(req.body).then().catch(() => { console.log("\nComment not added\n" + JSON.stringify(req.body, null, 4) + "\n"); });
    res.redirect("/about"); // will redirect in both cases: .then() and .catch()
});

// routes for /employee...
app.get("/employees", ensureLogin, (req, res) => {
    if (req.query !== {} || req.query.manager !== {}) {
        if (req.query.status)
            dataService.getEmployeesByStatus(req.query.status).then(data => {
                res.render("employeeList", { data: data, title: "Employees" });
            }).catch((err) => { res.render("employeeList", { data: {}, title: "Employees" }); });
        else if (req.query.department)
            dataService.getEmployeesByDepartment(req.query.department).then(data => {
                res.render("employeeList", { data: data, title: "Employees" });
            }).catch((err) => { res.render("employeeList", { data: {}, title: "Employees" }); });
        else if (req.query.manager)
            dataService.getEmployeesByManager(req.query.manager).then(data => {
                res.render("employeeList", { data: data, title: "Employees" });
            }).catch((err) => { res.render("employeeList", { data: {}, title: "Employees" }); });
        else if (Object.keys(req.query).length === 0)
            dataService.getAllEmployees().then((data) => {
                res.render("employeeList", { data: data, title: "Employees" });
            }).catch((err) => { res.render("employeeList", { data: {}, title: "Employees" }); });
        else {
            res.render("employeeList", { data: {}, title: "Employees" });
        }

    }
});

app.get("/employees/add", ensureLogin, (req, res) => {
    dataService.getDepartments().then(data => {
        res.render("addEmployee", { departments: data });
    }).catch(() => { res.render("addEmployee", { departments: [] }); })
});

app.get("/employees/:empNum", ensureLogin, (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeesByNum(req.params.empNum)
        .then((data) => {
            viewData.data = data; //store employee data in the "viewData" object as "data"
        }).catch(() => {
            viewData.data = null; // set employee to null if there was an error 
        }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"

            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching 
            // viewData.departments object

            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.data[0].department) {
                    viewData.departments[i].selected = true;
                }
            }

        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.data == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});


app.post("/employees/add", ensureLogin, (req, res) => {
    dataService.addEmployee(req.body).then(res.redirect("/employees")).catch(() => { console.log("\nEmployee not added" + req.body + "\n"); });
});
app.post("/employees/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(res.redirect("/employees")).catch(() => { console.log("\nEmployee not update" + req.body + "\n"); });
});
app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then(res.redirect("/employees"))
        .catch(() => { res.status(500).send("Unable to Remove Employee / Employee not found"); });
});

// routes for /departments...

app.get("/departments", ensureLogin, (req, res) => {
    dataService.getDepartments().then(data => {
        res.render("departmentList", { data: data, title: "Departments" });
    }).catch((err) => { res.render("departmentList", { data: {}, title: "Departments" }); });
});
app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(res.redirect("/departments")).catch(() => { console.log("\nDepartment not added" + req.body + "\n"); });
});
app.post("/departments/update", ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(res.redirect("/departments")).catch(() => { console.log("\nDepartment not updated" + req.body + "\n"); });
});
app.get("/departments/delete/:depId", ensureLogin, (req, res) => {
    dataService.deleteDepartmentById(req.params.depId).then(res.redirect("/departments"))
        .catch(() => { res.status(500).send("Unable to Remove Department / Department not found"); });
});

app.get("/departments/:departmentId", ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then(data => {
        res.render("department", { data: data });
    }).catch((err) => { res.status(404).send("Department Not Found"); });
});

// routes for /managers...
app.get("/managers", ensureLogin, (req, res) => {
    dataService.getManagers().then(data => {
        res.render("employeeList", { data: data, title: "Employees (Managers)" });

    }).catch((err) => { res.render("employeeList", { data: {}, title: "Employees (Managers)" }); });
});

// routes for login
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/api/updatePassword", (req, res) => {
    dataServiceAuth.checkUser({ user: req.body.user, password: req.body.currentPassword })
        .then(() => {
            dataServiceAuth.updatePassword(req.body)
                .then(() => {
                    res.json({ successMessage: "Password changed successfully for:" + req.body.user });
                })
                .catch((err) => { 
                    res.json({ errorMessage: err }); });
        })
        .catch((err) => { 
            res.json({ errorMessage: err }); });
});

app.post("/register", (req, res) => {

    dataServiceAuth.registerUser(req.body)
        .then(() => { res.render("register", { successMessage: "User created" }); })
        .catch((err) => { res.render("register", { errorMessage: err, user: req.body.user }); });
});

app.post("/login", (req, res) => {
    dataServiceAuth.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                username: user.user
            };
            res.redirect('/employees');
        })
        .catch((err) => { res.render("login", { errorMessage: err, user: req.body.user }); });
});

app.get("/logout", (req, res) => {
    delete req.session.user;
    res.redirect('/');
});

// 404 route...
app.use((req, res) => {
    res.status(404).send("Page Not Found");
})

dataService.initialize()
    .then(() => {
        dataServiceComments.initialize()
            .then(() => {
                dataServiceAuth.initialize()
                    .then(() => {
                        app.listen(HTTP_PORT, onHttpStart);
                    })
                    .catch(() => {
                        console.log("\nunable to start dataServiceAuth\n");
                    });
            })
            .catch(() => {
                console.log("\nunable to start dataServiceComments\n");
            });
    })
    .catch(() => {
        console.log("\nunable to start dataService\n");
    });
