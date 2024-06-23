import { createClient, RedisClientType } from "redis";

interface RedisConfigOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

class RedisConfig {
  private client: RedisClientType | null = null;
  private readonly host: string;
  private readonly port: number;
  // private readonly password?: string | undefined;
  // private readonly db?: number | undefined;

  constructor(options: RedisConfigOptions) {
    this.host = options.host;
    this.port = options.port;
    // this.password = options.password;
    // this.db = options.db;
  }

  public connect(): RedisClientType {
    if (this.client) {
      return this.client;
    }

    this.client = createClient({
      url: `redis://${this.host}:${this.port}`,
      // password: this.password,
      // database: this.db,
    });

    this.client.on("error", (error) => {
      console.error("Redis Client Error: ", error);
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
    });

    // this.client.connect();

    return this.client;
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error("Redis client not connected");
    }

    return this.client;
  }
}

const redisConfig = new RedisConfig({
  host: process.env["REDIS_HOST"] || "localhost",
  port: Number(process.env["REDIS_PORT"]) || 6379,
});

const redisClient = redisConfig.connect();

export default redisClient;

// class Cache {
//   private client: Redis.RedisClient;

//   constructor() {
//     this.client = Redis.createClient({
//       host: process.env["REDIS_HOST"],
//       port: parseInt(process.env["REDIS_PORT"]),
//     });
//   }

//   public get(key: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       this.client.get(
//         key,
//         (err: Error, reply: string | PromiseLike<string>) => {
//           if (err) {
//             reject(err);
//           }
//           resolve(reply);
//         }
//       );
//     });
//   }

//   public set(key: string, value: string): void {
//     this.client.set(key, value);
//   }
// }

// export const cache = new Cache();
