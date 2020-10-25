import * as amqp from 'amqplib';
import { IExchange } from '../sender/send';

export interface IAuthenticate {
  user: string;
  password: string;
}

export interface IParams {
  exchange: IExchange;
  queue: string;
  host: string;
  authenticate: IAuthenticate;
}

export class ConnectionsUtils {
  /**
   * Returns amqp connection
   *
   * @param param0
   */
  public static async generateConnection({ ...params }: Partial<IParams>) {
    try {
      /** Set utils with generated params */
      const uri = ConnectionsUtils.generateQuery(params);
      try {
        /** Define a new connection with previous uri */
        const connection = await amqp.connect(uri);
        return connection;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  /**
   * generate connection string
   *
   * @param params IParams object with options for connection
   */
  public static generateQuery(params: Partial<IParams>) {
    /** Retrieve host and authenticate data from params */
    const { host, authenticate } = params;
    /** Throw error if can't find valid host */
    if (!host) {
      throw new Error('No host provided');
    }

    let uriQuery = `${host}`;

    /** If we receive an authentication */
    if (authenticate) {
      /** Encode both params and generate uri query for login */
      const user = encodeURIComponent(authenticate.user);
      const pwd = encodeURIComponent(authenticate.password);
      uriQuery = `${user}:${pwd}@${host}`;
    }

    /** Return mounted URL from params */
    return `amqp://${uriQuery}`;
  }
}
