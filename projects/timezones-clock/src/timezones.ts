import { UtcPipe } from "./utc.pipe";

interface IDefaultTimezone {
  id: number;
  value: string;
  abbr: string;
  offset: number;
  isdst: boolean;
  text: string;
  utc: string[];
}

export interface ITimezone extends IDefaultTimezone {
  name: string;
  enabled: boolean;
}

const utcPipe = new UtcPipe();

export class Timezone implements ITimezone {
  id: number;
  value: string;
  abbr: string;
  offset: number;
  isdst: boolean;
  text: string;
  utc: string[];
  selected: boolean;
  name: string;
  editing: boolean;
  enabled: boolean;

  constructor(timezone: IDefaultTimezone) {
    this.id = timezone.id;
    this.value = timezone.value;
    this.abbr = timezone.abbr;
    this.offset = timezone.offset;
    this.text = timezone.text;
    this.utc = timezone.utc;
    this.enabled = false;
    this.name = Timezone.getDefaultName(this);
  }

  static getDefaultName(timezone: ITimezone): string {
    return utcPipe.transform(timezone.offset, timezone);
  }
}
