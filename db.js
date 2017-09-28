var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const TestBugger = require('test-bugger')
const testBugger = new TestBugger({'fileName':__filename})

const dbName = "rtb"
const dbURI = "mongodb://localhost/"+dbName

mongoose.connect(dbURI).then(function(){
    testBugger.successLog("Connection Successfully Established");
}).catch((err) => {
    testBugger.dangerLog("Error occured while connecting to Mongoose Server");
    testBugger.dangerLog(err);
    process.exit(1)
})

mongoose.connection.on('connected', function () {
    testBugger.successLog('Mongoose default connection open to ' + dbURI);

})

mongoose.connection.on('error', function (err) {
    testBugger.errorLog('Mongoose default connection error: ' + err);
    process.exit(1)
});

mongoose.connection.on('disconnected', function () {
    testBugger.successLog('Mongoose default connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        testBugger.successLog('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});