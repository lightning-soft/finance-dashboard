// import { MixinHelper } from '../../../../base-components/src/helpers/mixin.helper';
// import { Id } from 'communication';
// const { mixinDecorator } = MixinHelper;

// class WsRegister<T> {
//     _listeners: T[] = [];

//     register(listener: T) {
//         this._listeners.push(listener);
//     }

//     getItems(): T[] {
//         return this._listeners;
//     }
// }

// const wsListeners = new WsRegister<IWsListener>();
// const wsSenders = new WsRegister<IWsSender>();

// export interface IWsListener {
//     handleMessage(message: any, connectionId: Id);
//     send?(message: any, connectionId: Id);
// }

// export interface IWsSender {
//     handleMessage?(message: any, connectionId: Id);
//     send(message: any, connectionId: Id);
// }

// abstract class _WsListener {
//     send(message: any, connectionId: Id) {
//         for (const item of wsSenders.getItems()) {
//             item.send(message, connectionId);
//         }
//     }

//     abstract handleMessage(message: any, connectionId: Id);
// }

// abstract class _WsSender implements IWsSender {
//     handleMessage(message: any, connectionId: Id) {
//         for (const item of wsListeners.getItems()) {
//             item.send(message, connectionId);
//         }
//     }

//     abstract send(message: any, connectionId: Id);
// }

// export function WsListener() {
//     return (derivedCtor: any) => {
//         wsListeners.register(derivedCtor.constructor);
//         return mixinDecorator(_WsListener)(derivedCtor);
//     }
// }

// export function WsSender() {
//     return (derivedCtor: any) => {
//         wsSenders.register(derivedCtor.constructor);
//         return mixinDecorator(_WsSender)(derivedCtor);
//     }
// }
