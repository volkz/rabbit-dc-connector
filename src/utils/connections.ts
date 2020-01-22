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
   * generate connection string
   *
   * @param params IParams object with options for connection
   */
  public static generateQuery(params: Partial<IParams>) {
    const { host, authenticate } = params;
    if (!host) {
      throw new Error('No host provided');
    }

    let uriQuery = `${host}`;

    if (authenticate) {
      const user = encodeURIComponent(authenticate.user);
      const pwd = encodeURIComponent(authenticate.password);
      uriQuery = `${user}:${pwd}@${host}`;
    }

    return `amqp://${uriQuery}`;
  }
}
