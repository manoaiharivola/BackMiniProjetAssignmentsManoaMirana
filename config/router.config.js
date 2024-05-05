let assignmentsRoute = require('../routes/assignments.route')
const configureRouter = (app) => {
    const prefix = '/api';
    app.use(prefix +'/assignments', assignmentsRoute)
}

module.exports = configureRouter