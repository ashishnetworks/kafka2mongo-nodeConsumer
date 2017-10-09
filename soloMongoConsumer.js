'use strict';
require('./db')


const TestBugger = require('test-bugger')
const testBugger = new TestBugger({'fileName': __filename})

var kafka = require('kafka-node')
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var argv = require('optimist').argv;
var topic = argv.topic || "test-kafka";

var client = new Client('localhost:2181');
var topics = [{topic: topic, partition: 0}];
var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024,
    groupId: 'ExampleTestGroup1', id: 'consumer5'};

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);

var MongoWrapper = require('./MongoWrapper')
var mongoWrapper = new MongoWrapper('mongoConsumer')

consumer.on('message', async function(kafkaReceivedObject) {

    try{
        var messageObject = JSON.parse(kafkaReceivedObject.value)
        testBugger.successLog(messageObject);
        var inserted = await mongoWrapper.push(messageObject)

        setImmediate(function() {

            if (inserted) {
                consumer.commit(function (err, data) {
                    if (err) {
                        console.log("Commit Error: " + err)
                    } else {
                        console.log("Commit Responce: " + JSON.stringify(data))
                    }
                })
            }
        })

    } catch(err) {
        testBugger.errorLog("Error In Json Patsing")
        testBugger.errorLog(err.message)
    }



});

consumer.on('error', function (err) {
    console.log('error', err);
});

/*
* If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
*/
consumer.on('offsetOutOfRange', function (topic) {
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
        if (err) {
            return console.error(err);
        }
        var min = Math.min(offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});