import { Connection, ConnectionManager, getConnectionManager, createConnection, ConnectionOptions } from "typeorm";
import * as Entities from "./entity/Todo";

type TConnectionOptions = {
  [k: string]: ConnectionOptions
}

const getConnectionOptions = (): TConnectionOptions => {
  let options: ConnectionOptions = {
    type: 'postgres',
    synchronize: true,
    logging: false,
    entities: Object.values(Entities),
  };
  if (process.env.DATABASE_URL) {
    options = {
      ...options,
        url: process.env.DATABASE_URL,
    }
  } else {
    options = {
      ...options,
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
  }
  return {
    default: {...options}
  };
}

const connectionOptions: TConnectionOptions = getConnectionOptions();

export class Database {
  private connectionManager: ConnectionManager;
  static CONNECTION_NAME = 'default';

  constructor() {
    this.connectionManager = getConnectionManager()
  }

  private enititesChanged(prevEntities: any[], newEntities: any[]) {
    if (prevEntities.length !== newEntities.length) return true;

    for (let i = 0; i <prevEntities.length; i++) {
      if (prevEntities[i] !== newEntities[i]) return true;
    }
    return false;
  }

  private async updateConnectionEntities(connection: Connection, entities: any[]) {
    const prevEntities = connection.options.entities as any[];
    if (!this.enititesChanged(prevEntities, entities)) return;

    // @ts-ignore
    connection.options.entities = entities;

    // @ts-ignore
    connection.buildMetadatas()

    if (connection.options.synchronize) {
      await connection.synchronize()
    }
  }

  public async getConnection(): Promise<Connection> {
    let connection: Connection;
    if (this.connectionManager.has(Database.CONNECTION_NAME)) {
      connection = await this.connectionManager.get(Database.CONNECTION_NAME);

      if (!connection.isConnected) {
        connection = await connection.connect();
      }

      if (process.env.NODE_ENV !== 'production') {
        await this.updateConnectionEntities(
          connection,
          Object.values(Entities)
        );
      }
    } else {
      connection = await createConnection(
        connectionOptions[Database.CONNECTION_NAME]
      )
    }

    return connection;

  }

}