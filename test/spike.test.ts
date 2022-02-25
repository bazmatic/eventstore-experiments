const myEventType = "BuyOrder";

import * as EventStore from "@eventstore/db-client";
import assert from "assert";

let streamName = Math.random().toString(16);
let projectionName = Math.random().toString(16);

type AssetState = {
  totalOrders: number;
  totalAmount: number;
};

type State = {
  [key: string]: AssetState;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const startingEvents = [
  {
    type: myEventType,
    data: {
      asset: "BTC",
      assetAmount: 1,
      customerId: 1,
    },
  },
  {
    type: myEventType,
    data: {
      asset: "BTC",
      assetAmount: 2,
      customerId: 2,
    },
  },
  {
    type: myEventType,
    data: {
      asset: "ETH",
      assetAmount: 1.5,
      customerId: 2,
    },
  },
];

let client: EventStore.EventStoreDBClient;

beforeEach(() => {
  client = EventStore.EventStoreDBClient.connectionString(
    `esdb://localhost:2113?tls=false`
  );
});

describe("EventStream", () => {
  it("Append to stream", async () => {
    const events = startingEvents.map((e) => EventStore.jsonEvent(e));
    const result = await client.appendToStream(streamName, events);
    assert(result, "No result");
  });

  it("Read from stream", async () => {
    const events = await client.readStream(streamName, {
      fromRevision: EventStore.START,
      direction: EventStore.FORWARDS,
      maxCount: 10,
    });

    const resolvedEvents: EventStore.ResolvedEvent[] = [];
    for await (const event of events) {
      resolvedEvents.push(event);
    }
    assert(
      resolvedEvents.length === startingEvents.length,
      "Wrong number of events"
    );
  });

  it("Projection", async () => {
    const query = `
            fromStream('${streamName}')
                .when({
                    $init() {
                        return {
                            
                        };
                    },
                    ${myEventType}(state, evt) {
                        state[evt.data.asset] = {
                            totalOrders: state[evt.data.asset] ? state[evt.data.asset].totalOrders + 1 : 1,
                            totalAmount: state[evt.data.asset] ? state[evt.data.asset].totalAmount + evt.data.assetAmount : evt.data.assetAmount
                        }
                    }
                })
                .outputState();
            `;
    await client.createProjection(projectionName, query);
    await wait(500);

    const result: State = await client.getProjectionResult(projectionName);
    console.log(result);
    assert(result, "No result");
  });
});
