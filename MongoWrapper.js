"use strict";

const mongoose = require('mongoose')
mongoose.Promise = global.Promise;

const TestBugger = require('test-bugger')

function MongoWrapper(collectionName) {

    var testSchema = new mongoose.Schema({}, { strict: false });

    this.testBugger = new TestBugger({'fileName': __filename})
    this.Collection = mongoose.model(collectionName, testSchema)

}

MongoWrapper.prototype.push = async function(messageValueObject) {

    try {
        var collection = new this.Collection(messageValueObject)
        var result = await collection.save()
        console.log(JSON.stringify(result))
        return true

    } catch (err) {
        this.testBugger.dangerLog("Error in pushing Entry into MongoConsumed")
        this.testBugger.errorLog(err.message)
        return false
    }

}

module.exports = MongoWrapper