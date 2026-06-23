import {
  propagation,
  context,
  Context,
  TextMapGetter,
  TextMapSetter,
} from '@opentelemetry/api';

const setter: TextMapSetter<Record<string, string>> = {
  set(carrier, key, value) {
    carrier[key] = value;
  },
};

const getter: TextMapGetter<Record<string, string>> = {
  get(carrier, key) {
    return carrier[key];
  },
  keys(carrier) {
    return Object.keys(carrier);
  },
};

export class KafkaPropagator {
  static inject(headers: Record<string, string>): Record<string, string> {
    propagation.inject(context.active(), headers, setter);
    return headers;
  }

  static extract(headers: Record<string, string>): Context {
    return propagation.extract(context.active(), headers, getter);
  }
}
