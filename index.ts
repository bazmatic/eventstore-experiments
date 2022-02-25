/*const {
    EventStoreDBClient,
    jsonEvent,
    FORWARDS,
    START,
} = require("@eventstore/db-client");*/

import * as EventStore from "@eventstore/db-client";

/*const client = new EventStoreDBClient({
    endpoint: "localhost:1113",
    //connectionString: "esdb://localhost:2113?tls=false"
});*/

const client = EventStore.EventStoreDBClient.connectionString(`esdb://localhost:2113?tls=false`);

async function simpleTest() {
    const streamName = "hello";

    const event = EventStore.jsonEvent({
        type: "myUpdate",
        data: {
            fruit: ["apple", "banana", "pear"],
            name: "Bobno",
        },
    });

    try {
        const appendResult = await client.appendToStream(streamName, [event]);
        const events = client.readStream(streamName, {
            fromRevision: EventStore.START,
            direction: EventStore.FORWARDS,
            maxCount: 10,
        });
    
        for await (const event of events) {
            console.log(event);
        }
    } catch (err) {
        console.log(err);
    }
    

}

type MyState = {
    maxFruit: number;
    currentName: string;
}

/*function createMyStateProjection(client: EventStore.EventStoreDBClient) {
    const query = `
        fromStream('hello')
            .when({
                $init() {
                    return {
                        maxFruit: 0,
                        currentName: '',
                    };
                },
                myUpdate(s, e) {
                    s.maxFruit = Math.max(s.maxFruit, e.data.fruit.length);
                }
            })
            .transformBy((state) => state.count)
            .outputState();
    `;
    client.createProjection('myProjection', query);
}


async function getCurrentState(client: EventStore.EventStoreDBClient) {
    const result = await client.getProjectionResult('myProjection');
    return result;
}

simpleTest()
    .catch(console.error)
    .then(() => {
    }
);
*/
