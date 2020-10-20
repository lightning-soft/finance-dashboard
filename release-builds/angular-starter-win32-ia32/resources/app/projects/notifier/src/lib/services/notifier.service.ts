export abstract class NotifierService {
    abstract showSuccess(message: string);
    abstract showError(message: any, defaultMessage?: string);
}
