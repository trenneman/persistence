import {PersistentConfig} from '../persistent-config';

export function PostRemove(): MethodDecorator {
  return function(target: PObject, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    let postRemove = descriptor.value;
    if (typeof postRemove !== 'function') {
      throw new Error(`@PostRemove ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({postRemove});
    Reflect.deleteProperty(target, propertyKey);
  };
}
