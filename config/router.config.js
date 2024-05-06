let assignmentRoute = require('../routes/assignment.route')
let authenticationRoute = require('../routes/authentication.route')
const configureRouter = (app) => {
    const prefix = '/api';
    app.use(prefix +'/assignments', assignmentRoute)
    app.use(prefix +'/authentication', authenticationRoute)
}

module.exports = configureRouter