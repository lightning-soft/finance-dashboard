import { Id } from 'communication';

export abstract class ConnectionContainer {
  abstract getApiKeyByAccountId(accountId: Id): Id;
}
