import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'event' })
export class EventPipe implements PipeTransform {
  transform(event: string) {
    return event
      .toLowerCase()
      .replace('instance of ', '')
      .replace(/'/g, '');
  }
}
