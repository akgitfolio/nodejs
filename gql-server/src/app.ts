import express from "express";
import morgan from "morgan";
import cors from "cors";
import { ApolloServer, gql } from "apollo-server-express";
import { PubSub } from "graphql-subscriptions";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";

// Create a PubSub instance
const pubsub = new PubSub();

// Define the GraphQL schema
const typeDefs = gql`
  type Query {
    randomNumber: Float!
  }

  type Subscription {
    randomNumber: Float!
  }
`;

// Define the resolver functions
const resolvers = {
  Query: {
    randomNumber: () => Math.random(),
  },
  Subscription: {
    randomNumber: {
      subscribe: () => pubsub.asyncIterator(["RANDOM_NUMBER"]),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and Apollo server
const app = express();

app.use(morgan("dev"));
app.use(cors());

(async () => {
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  // Apply the Apollo GraphQL middleware to the Express app
  server.applyMiddleware({ app: app as any });

  // Create an HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket subscription server
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );

  // Start the server
  const port = 4000;
  httpServer.listen(port, () => {
    console.log(
      `Server is running at http://localhost:${port}${server.graphqlPath}`
    );
  });

  // Publish a random number every 5 seconds
  setInterval(() => {
    const randomNumber = Math.random();
    pubsub.publish("RANDOM_NUMBER", { randomNumber });
  }, 1000);
})();
