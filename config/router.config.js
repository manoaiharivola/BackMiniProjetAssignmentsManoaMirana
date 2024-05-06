let assignmentRoute = require('../routes/assignment.route')
const configureRouter = (app) => {
    const prefix = '/api';
    app.use(prefix +'/assignments', assignmentRoute)
}

module.exports = configureRouter